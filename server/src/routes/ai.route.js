import { Router } from 'express';
import { generateGemini } from '../controllers/ai.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { geminiSchema } from '../validations/ai.validation.js';
import { generationRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post(
  '/gemini',
  generationRateLimit,
  requireAuth,
  validate(geminiSchema),
  generateGemini
);

export default router;
