import { Router } from 'express';
import { createInteractiveStory } from '../controllers/interactiveStory.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.post('/', requireAuth, createInteractiveStory);

export default router;
