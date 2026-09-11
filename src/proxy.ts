import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const canonicalProductionHost = "leetmap-pro.vercel.app";
const legacyProductionHosts = new Set(["leetmap-hub.vercel.app"]);

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
