// app/api/feedback/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { feedback } = await req.json();

    if (!feedback || typeof feedback !== "string") {
      return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.FEEDBACK_EMAIL_USER,
        pass: process.env.FEEDBACK_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FEEDBACK_EMAIL_USER || "noreply@sportal.com",
      to: process.env.FEEDBACK_RECEIVER_EMAIL,
      subject: "📬 New Feedback from Sportal",
      text: feedback,
    });

    return NextResponse.json({ message: "Feedback sent successfully" });
  } catch (error: any) {
    console.error("❌ Feedback error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}
