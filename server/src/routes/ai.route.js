import { Router } from 'express';
import { generateGemini } from '../controllers/ai.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.post('/gemini', requireAuth, generateGemini);

export default router;
