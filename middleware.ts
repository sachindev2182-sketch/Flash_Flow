import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup";

  const isProtectedPage =
    pathname.startsWith("/dashboard") 
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/transactions/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
