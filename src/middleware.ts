import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/map"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Match all non-static, non-_next routes for pages
    '/((?!.*\\..*|_next).*)',
    // API routes
    '/api/(.*)',
    // tRPC routes
    '/trpc/(.*)',
  ],
};
