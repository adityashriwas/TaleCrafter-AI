# Payments Reference

Credit purchases are being migrated from the previous client-side PayPal flow to a backend-owned Stripe Checkout flow.

## Current Stripe Flow

The Next.js buy credits page lets authenticated users select one of the existing credit packs:

- Basic: 10 credits for 1.99 USD
- Premium: 75 credits for 3.99 USD
- Ultimate: 150 credits for 5.99 USD

The client asks the Express backend to create a Stripe Checkout session. The backend records a pending payment ledger row. Stripe then calls the backend webhook, where the signature, session, user, amount, currency, and plan are verified before credits are added from backend-owned code only. The success-page redirect only reads ledger status; it does not fulfill credits.

## Required Environment

Server-only:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLIENT_ORIGIN`, for example `http://localhost:3000`

The hosted Checkout implementation does not require a browser-exposed Stripe publishable key.

## Previous PayPal Behavior

The old implementation used PayPal buttons directly in the Next.js app. After PayPal approval, the browser updated the user's credit balance directly in the database.

That approach was removed because it trusted browser-side state for payment completion and credit updates.

## Production Operations

- Run `npm run migrate` from `server/` in each database environment.
- Run `npm run test:integration` against a non-production database before release.
- Configure the permanent Stripe webhook endpoint with completed, asynchronous success, and asynchronous failure Checkout events.
- Keep the Stripe CLI listener and its signing secret limited to local development.
- Store Clerk user ID in the payment ledger in addition to email if/when the user schema is expanded.
- Add an admin/support view for checking payment and fulfillment state.
