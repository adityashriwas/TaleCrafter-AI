import { z } from 'zod';
import { nonEmptyString } from './common.validation.js';

export const createStripeCheckoutSchema = z.object({
  body: z.object({ planId: nonEmptyString('Plan ID') }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const fulfillStripeCheckoutSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ sessionId: nonEmptyString('Stripe session ID') }),
  query: z.object({}).optional(),
});
