import { env } from "../env";
import { getRedis, isAiKeyCoolingDown, setAiKeyCooldown } from "../redis";
import { db } from "../db";

// ─── Key Pool ────────────────────────────────────────────────────────────────

interface AiKey {
  provider: "gemini" | "grok";
  keyIndex: number;
  apiKey: string;
}

function getGeminiKeys(): AiKey[] {
  const keys: AiKey[] = [];
  const keyEnvs = [
    env.GEMINI_API_KEY_1,
    env.GEMINI_API_KEY_2,
    env.GEMINI_API_KEY_3,
    env.GEMINI_API_KEY_4,
  ];
  keyEnvs.forEach((key, index) => {
    if (key) {
      keys.push({ provider: "gemini", keyIndex: index, apiKey: key });
    }
  });
  return keys;
}

function getGrokKeys(): AiKey[] {
  const keys: AiKey[] = [];
  const keyEnvs = [
    env.GROK_API_KEY_1,
    env.GROK_API_KEY_2,
    env.GROK_API_KEY_3,
    env.GROK_API_KEY_4,
  ];
  keyEnvs.forEach((key, index) => {
    if (key) {
      keys.push({ provider: "grok", keyIndex: index, apiKey: key });
    }
  });
  return keys;
}

// Round-robin counter stored in Redis
async function getNextKeyIndex(provider: string, total: number): Promise<number> {
  try {
    const redis = getRedis();
    const counter = await redis.incr(`ai:counter:${provider}`);
    return (counter - 1) % total;
  } catch {
    return 0;
  }
}

export async function getAvailableAiKey(
  provider: "gemini" | "grok"
): Promise<AiKey | null> {
  const keys = provider === "gemini" ? getGeminiKeys() : getGrokKeys();
  if (keys.length === 0) return null;

  const startIndex = await getNextKeyIndex(provider, keys.length);

  // Try from startIndex, wrap around
  for (let i = 0; i < keys.length; i++) {
    const idx = (startIndex + i) % keys.length;
    const key = keys[idx];
    const coolingDown = await isAiKeyCoolingDown(provider, key.keyIndex);
    if (!coolingDown) {
      return key;
    }
  }

  // All keys cooling down, return first one anyway as fallback
  return keys[startIndex % keys.length];
}

// ─── Usage Logging ────────────────────────────────────────────────────────────

async function logAiUsage(params: {
  provider: string;
  keyIndex: number;
  model: string;
  feature: string;
  tokens?: number;
  latencyMs?: number;
  status: "success" | "error" | "timeout";
  error?: string;
  userId?: string;
}) {
  try {
    await db.aiUsageLog.create({ data: params });
  } catch {
    // Non-fatal
  }
}

// ─── AI Request Wrapper ───────────────────────────────────────────────────────

interface AiRequestOptions {
  feature: string;
  userId?: string;
  preferProvider?: "gemini" | "grok";
  timeout?: number;
}

interface AiResponse {
  text: string;
  provider: string;
  keyIndex: number;
  tokens?: number;
}

export async function callAi(
  prompt: string,
  options: AiRequestOptions
): Promise<AiResponse> {
  const primaryProvider: "gemini" | "grok" =
    options.preferProvider || (env.AI_PRIMARY === "grok" ? "grok" : "gemini");
  const fallbackProvider: "gemini" | "grok" = primaryProvider === "gemini" ? "grok" : "gemini";
  const timeout = options.timeout || 30000;
  const providers: ("gemini" | "grok")[] = [primaryProvider, fallbackProvider];

  for (const provider of providers) {
    const key = await getAvailableAiKey(provider);
    if (!key) continue;

    const startTime = Date.now();
    try {
      let result: { text: string; tokens?: number };

      if (provider === "gemini") {
        result = await callGemini(key.apiKey, prompt, timeout);
      } else {
        result = await callGrok(key.apiKey, prompt, timeout);
      }

      await logAiUsage({
        provider,
        keyIndex: key.keyIndex,
        model: provider === "gemini" ? env.GEMINI_MODEL : env.GROK_MODEL,
        feature: options.feature,
        tokens: result.tokens,
        latencyMs: Date.now() - startTime,
        status: "success",
        userId: options.userId,
      });

      return {
        text: result.text,
        provider,
        keyIndex: key.keyIndex,
        tokens: result.tokens,
      };
    } catch (error: any) {
      console.error(`[AI Pool] Error on ${provider} key ${key.keyIndex}:`, error?.message || error);
      const latencyMs = Date.now() - startTime;
      const isRateLimit =
        error?.status === 429 || error?.message?.includes("rate");
      const isServerError =
        error?.status >= 500 || error?.code === "ECONNRESET";
      const isTimeout = error?.name === "AbortError";

      await logAiUsage({
        provider,
        keyIndex: key.keyIndex,
        model: provider === "gemini" ? env.GEMINI_MODEL : env.GROK_MODEL,
        feature: options.feature,
        latencyMs,
        status: isTimeout ? "timeout" : "error",
        error: error?.message,
        userId: options.userId,
      });

      if (isRateLimit || isServerError) {
        // Cool down this key
        await setAiKeyCooldown(provider, key.keyIndex, 60);
      }

      // Continue to next provider/key
      continue;
    }
  }

  throw new Error("All AI providers unavailable");
}

// ─── Gemini Adapter ──────────────────────────────────────────────────────────

async function callGemini(
  apiKey: string,
  prompt: string,
  timeout: number
): Promise<{ text: string; tokens?: number }> {
  const model = env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const errData = (await res.json().catch(() => ({}))) as any;
      const error: any = new Error(
        errData.error?.message || `Gemini API error ${res.status}`
      );
      error.status = res.status;
      throw error;
    }

    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const tokens = data.usageMetadata?.totalTokenCount;
    return { text, tokens };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Grok Adapter (OpenAI-compatible API) ────────────────────────────────────

async function callGrok(
  apiKey: string,
  prompt: string,
  timeout: number
): Promise<{ text: string; tokens?: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: env.GROK_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as any;
      const error = new Error(
        err.error?.message || `Grok API error ${response.status}`
      ) as any;
      error.status = response.status;
      throw error;
    }

    const data = (await response.json()) as any;
    const text = data.choices[0]?.message?.content || "";
    const tokens = data.usage?.total_tokens;
    return { text, tokens };
  } finally {
    clearTimeout(timer);
  }
}
