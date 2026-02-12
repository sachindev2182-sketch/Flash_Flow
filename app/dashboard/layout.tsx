import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("authToken")?.value; 

  console.log("TOKEN IN DASHBOARD:", token);

  if (!token) {
    redirect("/login");
  }

  return <>{children}</>;
}
