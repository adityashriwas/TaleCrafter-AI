# TaleCrafter AI

TaleCrafter AI is being migrated from a mostly client-side portfolio project into a production-style full-stack app.

## Structure

- `client/` - Next.js frontend, Clerk UI/session handling, public SEO pages, and user interface.
- `server/` - Express backend for database access, Clerk auth verification, AI services, image persistence, story mutations, credits, and admin APIs.

## Migration Goal

The main goal is to remove server-owned responsibilities from the frontend while keeping the app usable throughout the migration.

Backend-owned responsibilities include:

- Neon/Drizzle database access
- User sync and credit mutation
- Story creation, deletion, and interactive branching
- Gemini API calls
- Pollinations image URL generation
- Cloudinary image persistence
- Feedback forwarding
- Admin reads and mutations

Frontend-owned responsibilities include:

- Rendering the product UI
- Clerk sign-in/sign-up experience
- Public story and SEO pages
- Calling backend APIs with Clerk session tokens where required

## Roadmap

See [MIGRATION_ROADMAP.md](./MIGRATION_ROADMAP.md).

## Payments

Payments are temporarily disabled while the backend migration is underway. See [docs/payments-future.md](./docs/payments-future.md) for the old PayPal reference and future payment-provider requirements.
