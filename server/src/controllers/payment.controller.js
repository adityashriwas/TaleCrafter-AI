import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  constructStripeWebhookEvent,
  createStripeCheckoutSession,
  fulfillStripeCheckoutSession,
  getStripeCheckoutStatus,
  markStripeCheckoutFailed,
} from '../services/payment.service.js';

export const createStripeCheckout = asyncHandler(async (req, res) => {
  const checkout = await createStripeCheckoutSession({
    userId: req.auth.userId,
    planId: req.validated.body.planId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, checkout, 'Stripe checkout session created'));
});

export const getStripeCheckout = asyncHandler(async (req, res) => {
  const status = await getStripeCheckoutStatus({
    userId: req.auth.userId,
    sessionId: req.params.sessionId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, status, 'Stripe checkout status fetched'));
});

export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const event = constructStripeWebhookEvent({
    rawBody: req.body,
    signature: req.get('stripe-signature'),
  });

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    await fulfillStripeCheckoutSession({
      session: event.data.object,
      rawEvent: event,
    });
  } else if (event.type === 'checkout.session.async_payment_failed') {
    await markStripeCheckoutFailed({
      session: event.data.object,
      rawEvent: event,
    });
  }

  return res.status(200).json({ received: true });
});
