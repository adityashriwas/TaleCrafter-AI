import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createStripeCheckoutSession,
  fulfillStripeCheckoutSession,
} from '../services/payment.service.js';

export const createStripeCheckout = asyncHandler(async (req, res) => {
  const checkout = await createStripeCheckoutSession({
    userId: req.auth.userId,
    planId: req.body?.planId,
    origin: req.get('origin'),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, checkout, 'Stripe checkout session created'));
});

export const fulfillStripeCheckout = asyncHandler(async (req, res) => {
  const user = await fulfillStripeCheckoutSession({
    userId: req.auth.userId,
    sessionId: req.params.sessionId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Credits added successfully'));
});
