# Payments Reference

Credit purchases are being migrated from the previous client-side PayPal flow to a backend-owned Stripe Checkout flow.

## Current Stripe Flow

The Next.js buy credits page lets authenticated users select one of the existing credit packs:

- Basic: 10 credits for 1.99 USD
- Premium: 75 credits for 3.99 USD
- Ultimate: 150 credits for 5.99 USD

The client asks the Express backend to create a Stripe Checkout session. After Stripe redirects back to the app, the backend retrieves the session from Stripe, verifies the authenticated Clerk user, amount, currency, session status, and payment status, then adds credits from backend-owned code only.

## Required Environment

Server-only:

- `STRIPE_SECRET_KEY`
- `CLIENT_ORIGIN`, for example `http://localhost:3000`

The hosted Checkout implementation does not require a browser-exposed Stripe publishable key.

## Previous PayPal Behavior

The old implementation used PayPal buttons directly in the Next.js app. After PayPal approval, the browser updated the user's credit balance directly in the database.

That approach was removed because it trusted browser-side state for payment completion and credit updates.

## Remaining Production Hardening

- Add a local payments table with a unique Stripe session/payment intent ID.
- Fulfill credits idempotently from the payment record, not only Stripe session metadata.
- Add Stripe webhooks so credits are added even if the user closes the tab after paying.
- Verify webhook signatures with `STRIPE_WEBHOOK_SECRET`.
- Store payment amount, currency, provider status, Clerk user ID, user email, plan ID, credits, and fulfillment timestamp.
- Add an admin/support view for checking payment and fulfillment state.
