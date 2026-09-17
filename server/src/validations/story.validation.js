import { z } from 'zod';
import { nonEmptyString, paginationQuerySchema } from './common.validation.js';

const createStoryBodySchema = z.object({
  storySubject: nonEmptyString('Story subject'),
  storyType: nonEmptyString('Story type'),
  ageGroup: nonEmptyString('Age group'),
  imageStyle: nonEmptyString('Image style'),
});

export const createStorySchema = z.object({
  body: createStoryBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const storyIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ storyId: nonEmptyString('Story ID') }),
  query: z.object({}).optional(),
});

export const publicStoriesQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: paginationQuerySchema,
});

export const relatedStoriesQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ storyId: nonEmptyString('Story ID') }),
  query: paginationQuerySchema.extend({
    storyType: z.string().trim().optional(),
  }),
});
