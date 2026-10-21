import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { callAi } from "@/lib/ai/key-pool";
import { aiRateLimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "INVALID_MESSAGE" }, { status: 400 });
    }

    // Rate limit check
    const { success: allowed } = await aiRateLimit.limit(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "AI রিকোয়েস্ট লিমিট অতিক্রম করেছে। দয়া করে কিছুক্ষণ অপেক্ষা করুন।" },
        { status: 429 }
      );
    }

    // Fetch user's recent orders to scope context safely
    const recentOrders = await db.order.findMany({
      where: { userId: session.user.id },
      include: { game: true, package: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const ordersContext = recentOrders
      .map(
        (o) =>
          `- অর্ডার #${o.code}: ${o.game.name} (${o.package.amountLabel}), স্ট্যাটাস: ${o.status}, মূল্য: ৳${(Number(o.pricePoisha) / 100).toFixed(0)}`
      )
      .join("\n");

    const systemPrompt = `আপনি "টপআপ সেন্টার" (Topup Center) এর বিশ্বস্ত ও বিনয়ী বাংলা এআই সাপোর্ট অ্যাসিস্ট্যান্ট।
কাস্টমারের তথ্য:
নাম: ${session.user.name || "গ্রাহক"}
সর্বশেষ অর্ডারসমূহ:
${ordersContext || "কোনো সাম্প্রতিক অর্ডার নেই।"}

কঠোর নিয়মনীতি ও গার্ডরেল:
১. আপনি স্বয়ংক্রিয়ভাবে কোনো অর্ডার বা পেমেন্ট স্ট্যাটাস বদলাবেন না।
২. অন্য কোনো গ্রাহকের তথ্য প্রকাশ করবেন না।
৩. শুধুমাত্র টপআপ সেন্টার, গেম টপআপ, বিকাশ/নগদ পেমেন্ট, ও অর্ডার ট্র্যাকিং সংক্রান্ত উত্তর দিন।
৪. উত্তর সবসময় মার্জিত ও সহজ বাংলায় দিন।

গ্রাহকের প্রশ্ন: ${message}
উত্তর:`;

    const aiRes = await callAi(systemPrompt, {
      feature: "support_chat",
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      reply: aiRes.text,
      provider: aiRes.provider,
    });
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      {
        success: true,
        reply: "আমাদের এআই সাপোর্ট বর্তমানে কিছুটা ব্যস্ত। জরুরি সহায়তার জন্য অনুগ্রহ করে টেলিগ্রাম @topupcenter_support এ যোগাযোগ করুন অথবা সাপোর্ট টিকিট খুলুন।",
      },
      { status: 200 }
    );
  }
}
