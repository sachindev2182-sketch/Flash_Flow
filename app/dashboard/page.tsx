"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [customUser, setCustomUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 Listen Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
      }

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setCustomUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const user = customUser || firebaseUser;

  const handleLogout = async () => {
    await signOut(auth); // Firebase logout
await fetch("/api/auth/logout", {
    method: "GET",
    credentials: "include", 
  });

  router.replace("/login");  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-black rounded-full p-1">
            <Image
              src="/Finance_logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="invert"
            />
          </div>
          <span className="text-xl font-bold">Finance Tracker</span>
        </div>

        <button
          onClick={() => setShowProfile(true)}
          className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold"
        >
          {(user?.displayName || user?.name || user?.email)
            ?.charAt(0)
            .toUpperCase()}
        </button>
      </nav>

      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Welcome back,{" "}
          {user?.displayName || user?.name || user?.email}
        </h1>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg">
            <div className="bg-black text-white p-6 text-center relative">
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-3 right-4"
              >
                ✕
              </button>

              <div className="text-2xl font-bold mb-2">
                {user?.displayName || user?.name || "No Name"}
              </div>
              <p>{user?.email}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span>Role</span>
                <span className="font-semibold">
                  {customUser?.role || "user"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Verified</span>
                <span
                  className={
                    customUser?.isVerified
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {customUser?.isVerified ? "Yes" : "No"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-100 text-red-600 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
