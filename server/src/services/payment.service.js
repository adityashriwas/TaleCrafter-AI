import Stripe from 'stripe';
import ApiError from '../utils/ApiError.js';
import { incrementUserCredits, syncUserFromClerk } from './user.service.js';

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
    highlighted: true,
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
      fulfilled: 'false',
    },
  });

  if (!session.url) {
    throw new ApiError(502, 'Unable to create Stripe checkout session');
  }

  return { url: session.url, sessionId: session.id };
};

export const fulfillStripeCheckoutSession = async ({ userId, sessionId }) => {
  const safeSessionId = String(sessionId ?? '').trim();
  if (!safeSessionId) throw new ApiError(400, 'Stripe session ID is required');

  const user = await syncUserFromClerk(userId);
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(safeSessionId);
  const metadata = session.metadata ?? {};

  if (session.mode !== 'payment') {
    throw new ApiError(400, 'Invalid checkout session type');
  }

  if (metadata.userEmail !== user.userEmail) {
    throw new ApiError(403, 'This checkout session does not belong to you');
  }

  const plan = getPlan(metadata.planId);

  if (session.currency !== 'usd' || session.amount_total !== plan.amountCents) {
    throw new ApiError(400, 'Checkout session amount does not match the plan');
  }

  if (session.status !== 'complete') {
    throw new ApiError(402, 'Checkout session is not complete');
  }

  if (session.payment_status !== 'paid') {
    throw new ApiError(402, 'Payment has not been completed');
  }

  if (metadata.fulfilled === 'true') {
    return user;
  }
  const updatedUser = await incrementUserCredits(userId, plan.credits);

  await stripe.checkout.sessions.update(safeSessionId, {
    metadata: {
      ...metadata,
      fulfilled: 'true',
      fulfilledAt: new Date().toISOString(),
    },
  });

  return updatedUser;
};
