# TaleCrafter AI Backend Migration Roadmap

This roadmap keeps the migration progressive so the app stays usable after each phase.

## Current Direction

- Keep `client/` as the Next.js frontend.
- Use `server/` as the dedicated Express backend.
- Keep Clerk for authentication, verified on the backend with Clerk Express middleware.
- Keep Neon Postgres and Drizzle ORM as the source of truth.
- Move backend-owned logic out of the client: database access, Gemini, Cloudinary, Pollinations, credits, story mutations, admin mutations, and feedback forwarding.
- Keep public story reading and SEO-oriented pages available without auth.
- Replace the old client-side PayPal flow with backend-owned Stripe Checkout.

## Phase 0 - Repository And Planning

Status: complete

- Move Git tracking from `client/.git` to the project root.
- Add root `.gitignore` for the monorepo-style structure.
- Add a root README that documents the frontend/backend split.
- Document the old PayPal behavior and the new Stripe payment direction.
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
- Restore purchase flow through backend-owned Stripe Checkout.
- Keep admin credit updates using `ADMIN_EMAIL` for now.

Completed so far:

- Added `GET /api/v1/users/me` behind Clerk auth.
- Moved user creation/profile sync from `client/app/Provider.tsx` to the backend.
- Added a frontend API client that sends Clerk bearer tokens.
- Added backend-only credit decrement with authenticated Clerk identity.
- Replaced the create-story client-side credit update with the backend credit endpoint.
- Added Stripe Checkout session creation, a local payment ledger, and webhook-based credit fulfillment.

## Phase 3 - AI And Image Services

Status: in progress

- Move Gemini story generation and image analysis to backend.
- Move Pollinations URL generation to backend and use backend-only env vars.
- Move Cloudinary image persistence to backend.
- Remove public AI/image API keys from the frontend.

Completed so far:

- Added Clerk-protected `POST /api/v1/ai/gemini` on the backend.
- Moved Gemini text and image-analysis calls behind the backend, and moved full classic/interactive story generation into backend commands.
- Updated current Gemini callers to send Clerk bearer tokens through the frontend API client.
- Added Clerk-protected image routes for Pollinations URL creation and Cloudinary persistence.
- Moved Pollinations provider key usage and Cloudinary signing to the backend.
- Kept a keyless public fallback image URL builder for legacy/unpersisted story reads.

## Phase 4 - Story APIs

Status: in progress

- Add public story read endpoints for explore, detail, related stories, and SEO.
- Add protected story creation endpoints for classic and interactive stories.
- Add protected owner-only delete endpoints.
- Move slug generation and story data helpers to backend.
- Update frontend pages/components to use backend APIs.

Completed so far:

- Added backend story read/list/delete routes for public stories, current-user stories, slug/id detail, related stories, sitemap entries, and owner delete.
- Updated Explore stories to fetch from backend instead of direct Drizzle access.
- Updated Dashboard user story list and story deletion to use authenticated backend APIs.
- Updated public story detail helpers and related stories to fetch from backend APIs.
- Removed backend slug mutation from legacy Next view redirect; slug creation is backend-owned during story creation.
- Moved classic story request validation, credit check, Gemini generation, persistence, slug generation, chapter image generation, Cloudinary persistence, and credit decrement to protected backend `POST /api/v1/stories`.
- Moved interactive starter request validation, credit check, Gemini generation, root node persistence, starter choices, initial images, and credit decrement to protected backend `POST /api/v1/interactive-stories`.

## Phase 5 - Interactive Story APIs

Status: in progress

- Move interactive story loading, branching, continuation generation, and finalization to backend.
- Protect mutation endpoints with Clerk auth.
- Preserve public reading once a story is completed.
- Keep branching state changes backend-owned.

Completed so far:

- Added protected interactive story state loading through `GET /api/v1/interactive-stories/:storyId`.
- Moved branch continuation generation, node locking, next-node persistence, and generated page images to protected backend `POST /api/v1/interactive-stories/:storyId/choices`.
- Moved final resolution generation, completion state updates, compiled pages, and classic-story export to protected backend `POST /api/v1/interactive-stories/:storyId/complete`.
- Removed direct database, Gemini, Cloudinary, Pollinations, and slug logic from the interactive story client page.
- Moved dashboard interactive-story listing and deletion to protected backend APIs.

## Phase 6 - Admin APIs

Status: in progress

- Move admin story/user reads and mutations to backend.
- Keep current `ADMIN_EMAIL` authorization initially.
- Future discussion: replace email-based admin checks with Clerk metadata roles.

Completed so far:

- Added protected Express admin routes for story/user listing, deletion, credit updates, and story slug backfill.
- Updated the admin page to use authenticated backend APIs instead of direct Drizzle access.

## Phase 7 - Client Cleanup

Status: in progress

Remaining:

- Finish replacing legacy `any` and `@ts-ignore` frontend debt.
- Tighten accessibility warnings from the new React ESLint profile.
- Split root env values into local `server/.env` and browser-safe `client/.env.local`.

Completed so far:

- Removed the PayPal client dependency.
- Removed the PayPal provider wrapper from the client provider.
- Restored the buy credits UI with Stripe Checkout instead of PayPal.
- Removed client-side Drizzle, Neon, Gemini, Cloudinary, and database config files/dependencies.
- Removed replaced Next API routes for Gemini, image persistence, and admin slug backfill.
- Kept the Next sitemap route but changed it to consume the Express sitemap API instead of direct DB access.
- Added React/TypeScript ESLint tooling and aligned React type packages with the React 18 runtime.

## Phase 8 - Verification

Status: in progress

- Run frontend typecheck/build.
- Run backend lint/start smoke checks.
- Manually verify public story read, explore, sign-in, dashboard, story creation, image upload analysis, interactive branching, admin, and feedback.

Completed so far:

- Backend lint passes.
- Frontend typecheck passes.
- Frontend lint runs with warnings for existing legacy UI debt.

## Stripe Payment Hardening Plan

Status: in progress

- Stripe Checkout session creation is wired.
- Added a dedicated payment table schema with a unique Stripe session ID.
- Added Stripe webhook signature verification and webhook-based fulfillment.
- Store provider transaction state, raw event payload, and fulfillment timestamps.
- Credit addition is idempotent through the local payment table status.
- Remaining: run the SQL migration in the target database and add automated payment idempotency tests in the future test phase.
