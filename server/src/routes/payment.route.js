import { Router } from 'express';
import {
  createStripeCheckout,
  getStripeCheckout,
} from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { checkoutRateLimit } from '../middlewares/rateLimit.middleware.js';
import {
  createStripeCheckoutSchema,
  fulfillStripeCheckoutSchema,
} from '../validations/payment.validation.js';

const router = Router();

router.post(
  '/stripe/checkout-session',
  checkoutRateLimit,
  requireAuth,
  validate(createStripeCheckoutSchema),
  createStripeCheckout
);
router.get(
  '/stripe/checkout-session/:sessionId',
  requireAuth,
  validate(fulfillStripeCheckoutSchema),
  getStripeCheckout
);

export default router;
