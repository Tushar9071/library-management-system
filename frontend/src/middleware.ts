import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  const isAuthPath = path.startsWith("/auth");
  const isDashboardPath = path.startsWith("/dashboard");

  // If user is not authenticated and tries to access dashboard, redirect to /auth
  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // If user is authenticated and tries to access auth, redirect to /dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/",
  ],
};