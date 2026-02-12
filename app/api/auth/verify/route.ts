export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, otp, idToken } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const storedOtp = await Otp.findOne({ email });

    if (!storedOtp) {
      return NextResponse.json(
        { error: "No OTP found" },
        { status: 400 }
      );
    }

    if (storedOtp.expires < new Date()) {
      await Otp.deleteMany({ email });
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      );
    }

    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    let user;

    if (storedOtp.type === "signup") {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        user = existingUser;
      } else {
        user = await User.create({
          name: email.split("@")[0],
          email,
          isVerified: true,
        });
      }
    } else {
      user = await User.findOne({ email });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }

    // Delete OTP after success
    await Otp.deleteMany({ email });


    const response = NextResponse.json({
      success: true,
      message: "Verification successful",
    });
    const customToken = await adminAuth.createCustomToken(user._id.toString())
    // 🔥 Store Firebase ID token in HTTP-only cookie
    response.cookies.set("authToken", customToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour (Firebase ID token expiry)
    });

    return response;

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
