export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const decoded = await adminAuth.verifyIdToken(token);

    await connectDB();

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = await User.create({
        name: decoded.name,
        email: decoded.email,
        role: "user",
        isVerified: true,
      });
    }

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });
    
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
