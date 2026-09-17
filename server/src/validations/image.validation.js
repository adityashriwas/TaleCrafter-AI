import { z } from 'zod';
import { nonEmptyString } from './common.validation.js';

export const pollinationsImageUrlSchema = z.object({
  body: z.object({
    prompt: nonEmptyString('Prompt'),
    width: z.coerce.number().int().min(128).max(2048).optional(),
    height: z.coerce.number().int().min(128).max(2048).optional(),
    seed: z.union([z.string().trim(), z.number()]).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const persistImageSchema = z.object({
  body: z.object({
    imageUrl: z.string().trim().url('A valid image URL is required'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
