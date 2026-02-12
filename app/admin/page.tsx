"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  if (!user) return <div>Loading...</div>;

  if (user.role !== "admin") {
    return <div className="p-10 text-red-500">Access Denied</div>;
  }

  return <div className="p-10 text-3xl font-bold">Admin Panel</div>;
}
