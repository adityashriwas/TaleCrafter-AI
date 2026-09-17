import { z } from 'zod';
import { nonEmptyString } from './common.validation.js';

const formDataSchema = z.object({
  storySubject: nonEmptyString('Story subject'),
  storyType: nonEmptyString('Story type'),
  ageGroup: nonEmptyString('Age group'),
  imageStyle: nonEmptyString('Image style'),
});

export const createInteractiveStorySchema = z.object({
  body: formDataSchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const interactiveStoryIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ storyId: nonEmptyString('Interactive story ID') }),
  query: z.object({}).optional(),
});

export const chooseInteractiveStoryPathSchema = z.object({
  body: z
    .object({
      choice: nonEmptyString('Selected choice').optional(),
      selectedChoice: nonEmptyString('Selected choice').optional(),
    })
    .refine(data => data.choice || data.selectedChoice, {
      message: 'Selected choice is required',
    }),
  params: z.object({ storyId: nonEmptyString('Interactive story ID') }),
  query: z.object({}).optional(),
});

export const completeInteractiveStoryPathSchema = z.object({
  body: z
    .object({
      choice: z.string().trim().optional(),
      selectedChoice: z.string().trim().optional(),
    })
    .optional(),
  params: z.object({ storyId: nonEmptyString('Interactive story ID') }),
  query: z.object({}).optional(),
});
