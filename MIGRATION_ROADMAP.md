# TaleCrafter AI Backend Migration Roadmap

This roadmap keeps the migration progressive so the app stays usable after each phase.

## Current Direction

- Keep `client/` as the Next.js frontend.
- Use `server/` as the dedicated Express backend.
- Keep Clerk for authentication, verified on the backend with Clerk Express middleware.
- Keep Neon Postgres and Drizzle ORM as the source of truth.
- Move backend-owned logic out of the client: database access, Gemini, Cloudinary, Pollinations, credits, story mutations, admin mutations, and feedback forwarding.
- Keep public story reading and SEO-oriented pages available without auth.
- Remove PayPal for now and leave a documented future payment integration plan.

## Phase 0 - Repository And Planning

Status: complete

- Move Git tracking from `client/.git` to the project root.
- Add root `.gitignore` for the monorepo-style structure.
- Add a root README that documents the frontend/backend split.
- Document the old PayPal behavior for future payment-provider migration.
- Keep client and server independently runnable during migration.

## Phase 1 - Backend Foundation

Status: in progress

- Remove unused MERN template auth and MongoDB code.
- Add Express app structure for `routes`, `controllers`, `services`, `db`, and `middlewares`.
- Add Clerk backend auth middleware using `@clerk/express`.
- Move Drizzle schema/config to `server/`.
- Add shared API response and error handling conventions.
- Add `/api/v1/health`.

Completed so far:

- Removed the MERN template Mongo/JWT auth files.
- Added backend Drizzle schemas and Neon connection setup.
- Added Clerk auth middleware helpers.
- Added the health route and centralized 404/error responses.

## Phase 2 - User And Credit APIs

Status: in progress

- Move user creation/sync from `client/app/Provider.tsx` to backend.
- Add `GET /api/v1/users/me`.
- Add secure credit reads and backend-only credit decrement.
- Keep purchase flow disabled until a new payment provider is selected.
- Keep admin credit updates using `ADMIN_EMAIL` for now.

Completed so far:

- Added `GET /api/v1/users/me` behind Clerk auth.
- Moved user creation/profile sync from `client/app/Provider.tsx` to the backend.
- Added a frontend API client that sends Clerk bearer tokens.

## Phase 3 - AI And Image Services

Status: planned

- Move Gemini story generation and image analysis to backend.
- Move Pollinations URL generation to backend and use backend-only env vars.
- Move Cloudinary image persistence to backend.
- Remove public AI/image API keys from the frontend.

## Phase 4 - Story APIs

Status: planned

- Add public story read endpoints for explore, detail, related stories, and SEO.
- Add protected story creation endpoints for classic and interactive stories.
- Add protected owner-only delete endpoints.
- Move slug generation and story data helpers to backend.
- Update frontend pages/components to use backend APIs.

## Phase 5 - Interactive Story APIs

Status: planned

- Move interactive story loading, branching, continuation generation, and finalization to backend.
- Protect mutation endpoints with Clerk auth.
- Preserve public reading once a story is completed.
- Keep branching state changes backend-owned.

## Phase 6 - Admin APIs

Status: planned

- Move admin story/user reads and mutations to backend.
- Keep current `ADMIN_EMAIL` authorization initially.
- Future discussion: replace email-based admin checks with Clerk metadata roles.

## Phase 7 - Client Cleanup

Status: in progress

Remaining:

- Remove client-side database imports.
- Remove Next API routes that are replaced by Express, except SEO/sitemap routes that remain useful in Next.
- Remove backend-only libraries from the client package after their backend replacements are wired.
- Add a typed frontend API client that attaches Clerk tokens.

Completed so far:

- Removed the PayPal client dependency.
- Replaced the buy credits page with a payments-coming-soon placeholder.
- Removed the PayPal provider wrapper from the client provider.

## Phase 8 - Verification

Status: planned

- Run frontend typecheck/build.
- Run backend lint/start smoke checks.
- Manually verify public story read, explore, sign-in, dashboard, story creation, image upload analysis, interactive branching, admin, and feedback.

## Future Payment Provider Plan

Status: deferred

- Choose a new payment provider.
- Implement server-side payment verification before updating credits.
- Store payment records and provider transaction IDs.
- Make credit addition idempotent.
