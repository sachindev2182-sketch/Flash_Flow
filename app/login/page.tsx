/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already authenticated

  // =============================
  // SEND OTP
  // =============================
  const handleInitialLogin = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // VERIFY OTP
  // =============================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.join("").length !== 6) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid code");

      // Success → redirect
      const me = await fetch("/api/auth/me");
      const userData = await me.json();

      if (userData.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // OTP INPUT HANDLER
  // =============================
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      setError("Google login failed");
    }
  };

  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const token = await result.user.getIdToken();

      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("GitHub Login Error:", error);
      setError("GitHub login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f0f7] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#fdfdfe] to-[#d6e4f0] flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full sm:max-w-[460px] bg-white p-6 sm:p-10 md:p-12 rounded-[30px] sm:rounded-[45px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        {/* LOGO */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-black p-2.5 sm:p-3 rounded-full shadow-lg transition-transform hover:scale-110">
            <Image
              src="/Finance_logo.png"
              alt="Finance Logo"
              width={32}
              height={32}
              className="invert"
            />
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d0c22] tracking-tight mb-2 sm:mb-3">
            {step === 1 ? "Welcome back" : "Enter passcode"}
          </h1>
          <p className="text-[#6e6d7a] text-sm sm:text-[15px] font-medium break-all px-2">
            {step === 1
              ? "Continue your journey to financial freedom"
              : `Sent to ${email}`}
          </p>
        </div>

        <div className="w-full">
          {step === 1 ? (
            <div className="animate-in fade-in duration-700">
              {/* SOCIAL LOGIN */}
              <div className="flex flex-col gap-3 mb-6 sm:mb-8">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 border border-transparent rounded-[18px] font-bold text-white bg-[#4285f4] hover:bg-[#357ae8] transition-all shadow-md text-sm sm:text-[15px]"
                >
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    className="w-4 h-4 sm:w-5 sm:h-5 brightness-200"
                    alt="Google"
                  />
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={handleGithubLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 border border-transparent rounded-[18px] font-bold text-white bg-[#24292f] hover:bg-[#1a1e22] transition-all shadow-md text-sm sm:text-[15px]"
                >
                  <Github size={18} className="sm:w-5 sm:h-5" />
                  Continue with GitHub
                </button>
              </div>

              <div className="relative flex items-center mb-8 sm:mb-10">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="mx-4 text-[#9e9ea7] text-xs sm:text-[14px] font-bold uppercase tracking-wider">
                  OR
                </span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* EMAIL LOGIN */}
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-[14px] font-bold text-[#1a1c2e] ml-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 sm:px-5 sm:py-4 bg-[#f8f9fb] border-transparent rounded-[15px] sm:rounded-[18px] text-sm sm:text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#4285f4] transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs sm:text-sm font-bold text-center">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleInitialLogin}
                  disabled={loading}
                  className="w-full py-4 sm:py-5 bg-[#14162e] text-white rounded-[18px] sm:rounded-[20px] font-bold text-[16px] sm:text-[17px] shadow-xl hover:bg-[#1f2142] transition-all active:scale-[0.98] disabled:bg-gray-300 mt-4 sm:mt-6"
                >
                  {loading ? "Please wait..." : "Continue"}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-8 sm:space-y-10 animate-in zoom-in-95 duration-500"
            >
              <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    className="w-full h-12 sm:h-16 text-center text-xl sm:text-2xl font-black bg-[#f8f9fb] border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-[#4285f4] outline-none transition-all"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-xs sm:text-sm font-bold text-center">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 sm:py-5 bg-[#14162e] text-white rounded-[18px] sm:rounded-[20px] font-bold text-[16px] sm:text-[17px] shadow-xl active:scale-95 transition-all"
                >
                  {loading ? "Verifying..." : "Login"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[11px] sm:text-xs font-bold text-[#6e6d7a] hover:text-black transition-colors uppercase tracking-widest"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-[#6e6d7a] text-sm sm:text-[15px] font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#d9a34a] font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
