import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Support both Form Data (action) and JSON
    const contentType = req.headers.get("content-type") || "";
    let subject = "";
    let message = "";
    let orderCode = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      subject = body.subject;
      message = body.message;
      orderCode = body.orderCode;
    } else {
      const formData = await req.formData();
      subject = (formData.get("subject") as string) || "";
      message = (formData.get("message") as string) || "";
      orderCode = (formData.get("orderCode") as string) || "";
    }

    if (!subject || !message) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    // Create ticket & initial message
    const ticket = await db.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        orderId: orderCode || null,
        messages: {
          create: {
            userId: session.user.id,
            body: message,
          },
        },
      },
    });

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/support?created=true", req.url));
    }

    return NextResponse.json({ success: true, ticket });
  } catch (err: unknown) {
    console.error("Create ticket error:", err);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
