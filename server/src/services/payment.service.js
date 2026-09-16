import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { Payments } from '../db/schema.js';
import ApiError from '../utils/ApiError.js';
import {
  incrementUserCreditsByEmail,
  syncUserFromClerk,
} from './user.service.js';

export const CREDIT_PLANS = [
  {
    id: 'basic',
    title: 'Basic',
    price: 1.99,
    amountCents: 199,
    credits: 10,
    subtitle: 'Great for getting started',
    highlighted: false,
  },
  {
    id: 'premium',
    title: 'Premium',
    price: 3.99,
    amountCents: 399,
    credits: 75,
    subtitle: 'Most popular for regular creators',
    highlighted: true,
  },
  {
    id: 'ultimate',
    title: 'Ultimate',
    price: 5.99,
    amountCents: 599,
    credits: 150,
    subtitle: 'Best value for high-volume usage',
    highlighted: false,
  },
];

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new ApiError(503, 'Stripe is not configured');
  }

  return new Stripe(secretKey);
};

const getPlan = planId => {
  const plan = CREDIT_PLANS.find(item => item.id === planId);
  if (!plan) throw new ApiError(400, 'Invalid credit plan');
  return plan;
};

const getAppOrigin = origin => {
  const safeOrigin = String(origin ?? '').trim().replace(/\/$/, '');
  if (safeOrigin) return safeOrigin;

  const configured = String(process.env.CLIENT_ORIGIN ?? process.env.SITE_URL ?? '').trim();
  if (configured) return configured.replace(/\/$/, '');

  return 'http://localhost:3000';
};

const getPaymentBySessionId = async sessionId => {
  const rows = await db
    .select()
    .from(Payments)
    .where(eq(Payments.providerSessionId, sessionId))
    .limit(1);

  return rows[0] ?? null;
};

const paymentIntentIdFromSession = session => {
  const value = session.payment_intent;
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.id ?? null;
};

const assertSessionMatchesPlan = ({ session, payment }) => {
  const plan = getPlan(payment.planId);

  if (session.mode !== 'payment') {
    throw new ApiError(400, 'Invalid checkout session type');
  }

  if (session.currency !== payment.currency || session.amount_total !== payment.amountCents) {
    throw new ApiError(400, 'Checkout session amount does not match the payment ledger');
  }

  if (plan.amountCents !== payment.amountCents || plan.credits !== payment.credits) {
    throw new ApiError(400, 'Payment ledger does not match the configured plan');
  }

  if (session.metadata?.userEmail !== payment.userEmail) {
    throw new ApiError(403, 'Checkout session user does not match the payment ledger');
  }
};

export const createStripeCheckoutSession = async ({ userId, planId, origin }) => {
  const user = await syncUserFromClerk(userId);
  const plan = getPlan(planId);
  const appOrigin = getAppOrigin(origin);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: user.userEmail,
    customer_email: user.userEmail,
    success_url: `${appOrigin}/buy-credits?stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appOrigin}/buy-credits?stripe_cancelled=1`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: plan.amountCents,
          product_data: {
            name: `TaleCrafter AI ${plan.title} Credits`,
            description: `${plan.credits} story generation credits`,
          },
        },
      },
    ],
    metadata: {
      planId: plan.id,
      credits: String(plan.credits),
      userEmail: user.userEmail,
    },
  });

  if (!session.url) {
    throw new ApiError(502, 'Unable to create Stripe checkout session');
  }

  await db
    .insert(Payments)
    .values({
      provider: 'stripe',
      providerSessionId: session.id,
      userEmail: user.userEmail,
      planId: plan.id,
      amountCents: plan.amountCents,
      currency: 'usd',
      credits: plan.credits,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing({ target: Payments.providerSessionId });

  return { url: session.url, sessionId: session.id };
};

export const getStripeCheckoutStatus = async ({ userId, sessionId }) => {
  const safeSessionId = String(sessionId ?? '').trim();
  if (!safeSessionId) throw new ApiError(400, 'Stripe session ID is required');

  const user = await syncUserFromClerk(userId);
  const payment = await getPaymentBySessionId(safeSessionId);

  if (!payment) throw new ApiError(404, 'Payment not found');
  if (payment.userEmail !== user.userEmail) {
    throw new ApiError(403, 'This checkout session does not belong to you');
  }

  return {
    status: payment.status,
    credits: payment.credits,
    fulfilledAt: payment.fulfilledAt,
    user,
  };
};

export const fulfillStripeCheckoutSession = async ({ session, rawEvent }) => {
  const safeSessionId = String(session?.id ?? '').trim();
  if (!safeSessionId) throw new ApiError(400, 'Stripe session ID is required');

  const payment = await getPaymentBySessionId(safeSessionId);
  if (!payment) throw new ApiError(404, 'Payment ledger entry not found');

  assertSessionMatchesPlan({ session, payment });

  if (payment.status === 'fulfilled') {
    return { status: 'fulfilled', idempotent: true };
  }

  if (session.status !== 'complete' || session.payment_status !== 'paid') {
    await db
      .update(Payments)
      .set({
        status: 'failed',
        rawEvent,
        updatedAt: new Date(),
      })
      .where(eq(Payments.providerSessionId, safeSessionId));

    throw new ApiError(402, 'Payment has not been completed');
  }

  const updatedUser = await incrementUserCreditsByEmail(payment.userEmail, payment.credits);

  await db
    .update(Payments)
    .set({
      status: 'fulfilled',
      providerPaymentIntentId: paymentIntentIdFromSession(session),
      rawEvent,
      fulfilledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(Payments.providerSessionId, safeSessionId));

  return { status: 'fulfilled', user: updatedUser };
};

export const constructStripeWebhookEvent = ({ rawBody, signature }) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new ApiError(503, 'Stripe webhook secret is not configured');
  }

  if (!signature) {
    throw new ApiError(400, 'Stripe signature is required');
  }

  const stripe = getStripe();

  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    throw new ApiError(400, 'Invalid Stripe webhook signature');
  }
};
