import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ??
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ??
  ""
)
  .trim()
  .toLowerCase();

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/buy-credits(.*)",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? "";

    if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
