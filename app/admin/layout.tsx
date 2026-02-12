import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { adminAuth } from "@/lib/firebase-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    await connectDB();
    const user = await User.findOne({ email: decoded.email });

    if (!user || user.role !== "admin") {
      redirect("/dashboard");
    }

    return <>{children}</>;
  } catch (error) {
    redirect("/login");
  }
}
