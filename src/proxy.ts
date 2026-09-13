import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const canonicalProductionHost = "www.leetmap-pro.com";
const legacyProductionHosts = new Set(["leetmap-hub.vercel.app", "leetmap-pro.vercel.app"]);

const isProtectedApiRoute = createRouteMatcher([
  "/api/sync(.*)",
  "/api/user/progress(.*)",
]);

function isAuthorizedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

export default clerkMiddleware(
  async (auth, request) => {
    if (legacyProductionHosts.has(request.nextUrl.hostname)) {
      const canonicalUrl = request.nextUrl.clone();
      canonicalUrl.hostname = canonicalProductionHost;
      canonicalUrl.protocol = "https:";
      canonicalUrl.port = "";
      return NextResponse.redirect(canonicalUrl, 308);
    }

    if (isProtectedApiRoute(request) && !isAuthorizedCronRequest(request)) {
      await auth.protect();
    }
  },
  {
    contentSecurityPolicy: {
      strict: true,
      directives: {
        'base-uri': ["'self'"],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'img-src': ["'self'", "https://img.clerk.com", "https://www.google.com", "data:", "https://pagead2.googlesyndication.com", "https://*.googlesyndication.com", "https://*.doubleclick.net"],
        'script-src': ["'self'", "https://pagead2.googlesyndication.com", "https://tpc.googlesyndication.com", "https://googleads.g.doubleclick.net"],
        'frame-src': ["'self'", "https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com", "https://pagead2.googlesyndication.com", "https://www.google.com"],
        'connect-src': ["'self'", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com"],
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
