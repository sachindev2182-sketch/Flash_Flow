import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      type: "login",
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP",
      html: `<h2>Your OTP is: ${otp}</h2><p>Expires in 10 minutes</p>`,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
