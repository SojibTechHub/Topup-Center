// API client for Topup Center Frontend -> Backend

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  // If running in browser, relative path /api/... uses Next.js rewrites to avoid CORS
  const isBrowser = typeof window !== "undefined";
  const url = isBrowser
    ? endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    : `${BACKEND_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `Request failed (${res.status})`,
      };
    }

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

export { BACKEND_URL };

