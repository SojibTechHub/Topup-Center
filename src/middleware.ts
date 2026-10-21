import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/wallet", "/orders", "/profile", "/support", "/checkout"];
// Routes only for guests (redirect to dashboard if logged in)
const authRoutes = ["/login", "/register", "/forgot-password", "/verify"];
// Admin routes
const adminRoutes = ["/admin"];

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = session?.user?.role;
    if (!["STAFF", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin 2FA check
    if (["ADMIN", "SUPER_ADMIN"].includes(role)) {
      const has2FA = session?.user?.twoFactorEnabled;
      // Allow access to 2FA setup page
      if (!has2FA && !pathname.startsWith("/admin/2fa-setup")) {
        // In production, force 2FA setup for admins
        if (process.env.NODE_ENV === "production") {
          return NextResponse.redirect(new URL("/admin/2fa-setup", req.url));
        }
      }
    }
  }

  // Customer protected routes
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !pathname.startsWith("/admin")
  ) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (session?.user?.status === "BANNED") {
      return NextResponse.redirect(new URL("/banned", req.url));
    }
  }

  // Auth routes - redirect if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Security headers on all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|brand|games|payments).*)",
  ],
};
