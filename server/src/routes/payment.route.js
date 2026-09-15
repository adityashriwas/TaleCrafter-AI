import { Router } from 'express';
import {
  createStripeCheckout,
  fulfillStripeCheckout,
} from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.post('/stripe/checkout-session', requireAuth, createStripeCheckout);
router.post(
  '/stripe/checkout-session/:sessionId/fulfill',
  requireAuth,
  fulfillStripeCheckout
);

export default router;
