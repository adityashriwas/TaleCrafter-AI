import { z } from 'zod';

export const nonEmptyString = fieldName =>
  z
    .string({ message: `${fieldName} is required` })
    .trim()
    .min(1, `${fieldName} is required`);

export const positiveInteger = fieldName =>
  z.coerce
    .number()
    .int(`${fieldName} must be an integer`)
    .positive(`${fieldName} must be positive`);

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
