# TaleCrafter AI

TaleCrafter AI is a full-stack story generation application with a Next.js client and an Express API.

## Structure

- `client/` - Next.js frontend, Clerk UI/session handling, public SEO pages, and user interface.
- `server/` - Express backend for database access, Clerk auth verification, AI services, image persistence, story mutations, credits, and admin APIs.

## Local Development

1. Copy `client/.env.example` to `client/.env.local` and `server/.env.example` to `server/.env`.
2. Install dependencies independently in `client/` and `server/` with `npm ci`.
3. Apply database migrations with `npm run migrate` from `server/`.
4. Start the API with `npm run dev` from `server/`.
5. Start Next.js with `npm run dev` from `client/`.

The client runs on `http://localhost:3000`; the API runs on `http://localhost:8000`. API liveness is available at `/api/v1/health` and database readiness at `/api/v1/health/ready`.

## Ownership

Backend-owned responsibilities:

- Neon/Drizzle database access
- User sync and credit mutation
- Story creation, deletion, and interactive branching
- Gemini API calls
- Pollinations image URL generation
- Cloudinary image persistence
- Feedback forwarding
- Admin reads and mutations

Frontend-owned responsibilities:

- Rendering the product UI
- Clerk sign-in/sign-up experience
- Public story and SEO pages
- Calling backend APIs with Clerk session tokens where required

## Verification

Run these commands before deployment:

```sh
cd server
npm ci
npm run migrate
npm run check
npm test
npm run test:integration

cd ../client
npm ci
npm run typecheck
npm run lint
npm run build
```

The payment integration test creates isolated temporary rows and removes them after verifying concurrent webhook idempotency.

## Deployment

- Deploy `client/` and `server/` as separate services.
- Set `NODE_ENV=production` on the API. Startup fails fast when production-critical configuration is missing or malformed.
- Set `NEXT_PUBLIC_API_BASE_URL` to the deployed API URL ending in `/api/v1`.
- Set `CLIENT_ORIGIN` and `CORS_ORIGIN` to the deployed client origin.
- Run `npm run migrate` as the backend release command before `npm start`.
- Configure the platform health check as `/api/v1/health/ready`.
- Register `${API_URL}/api/v1/payments/stripe/webhook` in Stripe and subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`.
- Store all server values from `server/.env.example` in the hosting provider's encrypted environment settings. Never expose them through `NEXT_PUBLIC_*` variables.

Local Stripe webhook forwarding still uses the Stripe CLI; production uses the permanent Dashboard webhook endpoint and its own signing secret.

## Payments

Credit purchases now use Stripe Checkout through the Express backend. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `CLIENT_ORIGIN` in `server/.env`, run the payment ledger migration, then use the buy credits page to create a protected Checkout session. Credits are fulfilled from the Stripe webhook, not from browser success-page state.

Webhook fulfillment uses an atomic database statement, so concurrent duplicate events grant credits exactly once. See [docs/payments-future.md](./docs/payments-future.md) for operational details.
