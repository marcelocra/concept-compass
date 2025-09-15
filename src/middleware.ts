import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes should be protected (require authentication)
const isProtectedRoute = createRouteMatcher(["/", "/api/maps(.*)", "/api/generate(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect the matched routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// This is the default for Clerk, per their setup docs. Doesn't block any routes.
// export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
