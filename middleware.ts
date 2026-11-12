import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Origin must match the Host the request was sent to (exact match including
 * port). Browsers always send a matching Origin on same-origin POSTs; curl
 * and server-to-server clients usually send no Origin at all (allowed).
 */
function isOriginAllowed(origin: string | null, host: string): boolean {
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function securityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(self), microphone=(self), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      // Next.js dev tooling requires eval; production does not allow it.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "frame-src https://checkout.razorpay.com https://api.razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  };
  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }
  return headers;
}

export function middleware(request: NextRequest) {
  const secHeaders = securityHeaders();

  // CSRF: state-changing cross-origin browser requests without a matching
  // origin are rejected. The blocked response carries fresh headers only —
  // never the markers from NextResponse.next() (which would tell Next to
  // continue the chain and silently discard this response).
  if (MUTATING_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") ?? "localhost:3000";
    if (origin && !isOriginAllowed(origin, host)) {
      const blocked = NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
      for (const [key, value] of Object.entries(secHeaders)) {
        blocked.headers.set(key, value);
      }
      return blocked;
    }
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(secHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
