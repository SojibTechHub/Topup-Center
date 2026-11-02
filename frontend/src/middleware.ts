import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/wallet", "/orders", "/profile", "/support", "/checkout"];
// Routes only for guests (redirect to dashboard if logged in)
const authRoutes = ["/login", "/register", "/forgot-password", "/verify"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for NextAuth / Auth.js session cookie (Edge compatible)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Admin routes - require login
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    // Full role-based authorization (STAFF, ADMIN, SUPER_ADMIN) is verified
    // securely in src/app/admin/layout.tsx on the Node.js runtime.
  }

  // Customer protected routes
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !pathname.startsWith("/admin")
  ) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes - redirect if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
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
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|brand|games|payments).*)",
  ],
};
