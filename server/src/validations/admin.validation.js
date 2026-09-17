import { z } from 'zod';
import { nonEmptyString, positiveInteger } from './common.validation.js';

export const adminBackfillSlugsSchema = z.object({
  body: z
    .object({ limit: z.coerce.number().int().min(1).max(1000).optional() })
    .optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const adminStoryIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ storyId: nonEmptyString('Story ID') }),
  query: z.object({}).optional(),
});

export const adminUserEmailParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    userEmail: z.string().trim().email('Valid user email is required'),
  }),
  query: z.object({}).optional(),
});

export const adminUpdateUserCreditSchema = z.object({
  body: z.object({
    credit: z.coerce.number().int().min(0, 'Credit cannot be negative'),
  }),
  params: z.object({
    userEmail: z.string().trim().email('Valid user email is required'),
  }),
  query: z.object({}).optional(),
});

export const adminSitemapPageSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ page: positiveInteger('Sitemap page') }),
  query: z.object({}).optional(),
});
