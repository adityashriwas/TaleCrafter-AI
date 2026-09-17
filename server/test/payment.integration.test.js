import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const enabled = process.env.RUN_INTEGRATION_TESTS === 'true';

test(
  'concurrent Stripe fulfillment grants credits exactly once',
  { skip: !enabled },
  async () => {
    const [{ eq }, { db }, { Payments, Users }, paymentService] =
      await Promise.all([
        import('drizzle-orm'),
        import('../src/db/index.js'),
        import('../src/db/schema.js'),
        import('../src/services/payment.service.js'),
      ]);

    const suffix = randomUUID().replaceAll('-', '');
    const userEmail = `payment-test-${suffix}@example.invalid`;
    const sessionId = `cs_test_${suffix}`;
    const session = {
      id: sessionId,
      mode: 'payment',
      currency: 'usd',
      amount_total: 199,
      status: 'complete',
      payment_status: 'paid',
      payment_intent: `pi_test_${suffix}`,
      metadata: { userEmail },
    };

    try {
      await db.insert(Users).values({
        userEmail,
        userName: 'Payment Test',
        userImage: '',
        credit: 5,
      });
      await db.insert(Payments).values({
        provider: 'stripe',
        providerSessionId: sessionId,
        userEmail,
        planId: 'basic',
        amountCents: 199,
        currency: 'usd',
        credits: 10,
        status: 'pending',
      });

      const results = await Promise.all([
        paymentService.fulfillStripeCheckoutSession({
          session,
          rawEvent: {
            id: `evt_a_${suffix}`,
            type: 'checkout.session.completed',
          },
        }),
        paymentService.fulfillStripeCheckoutSession({
          session,
          rawEvent: {
            id: `evt_b_${suffix}`,
            type: 'checkout.session.completed',
          },
        }),
      ]);

      const [user] = await db
        .select({ credit: Users.credit })
        .from(Users)
        .where(eq(Users.userEmail, userEmail));
      const [payment] = await db
        .select({ status: Payments.status })
        .from(Payments)
        .where(eq(Payments.providerSessionId, sessionId));

      assert.equal(user.credit, 15);
      assert.equal(payment.status, 'fulfilled');
      assert.equal(results.filter(result => result.idempotent).length, 1);
    } finally {
      await db
        .delete(Payments)
        .where(eq(Payments.providerSessionId, sessionId));
      await db.delete(Users).where(eq(Users.userEmail, userEmail));
    }
  }
);
