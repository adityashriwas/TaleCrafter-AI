import { z } from 'zod';

export const decrementCreditsSchema = z.object({
  body: z
    .object({ amount: z.coerce.number().int().positive().default(1) })
    .optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
