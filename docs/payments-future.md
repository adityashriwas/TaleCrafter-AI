# Future Payments Reference

Payments are intentionally disabled during the backend migration.

## Previous Behavior

The old client-side implementation used PayPal buttons in the Next.js app to sell credit packs:

- Basic: 10 credits for 1.99 USD
- Premium: 75 credits for 3.99 USD
- Ultimate: 150 credits for 5.99 USD

After PayPal approval, the client directly updated the user's credit balance in the database.

## Why It Was Removed

The previous flow trusted browser-side state for payment completion and credit updates. A production implementation must verify the payment on the backend before credits are granted.

## Requirements For The Next Payment Provider

- Create payment/order from the backend.
- Verify provider callback or capture result on the backend.
- Confirm amount, currency, product/plan, status, and authenticated Clerk user.
- Store a payment record with provider transaction ID.
- Make credit fulfillment idempotent so refreshes/retries cannot duplicate credits.
- Only update credits from backend-owned code.

## Temporary Behavior

The buy credits page should remain available, but it should show a "payments coming soon" style message until the new provider is chosen.
