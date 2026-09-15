import { z } from 'zod';
import { nonEmptyString } from './common.validation.js';

export const geminiSchema = z.object({
  body: z.object({
    prompt: nonEmptyString('Prompt'),
    mode: z.enum(['text', 'image-analysis', 'story-generation']).optional(),
    imageBase64: z.string().trim().optional(),
    mimeType: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
