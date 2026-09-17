import { Router } from 'express';
import {
  chooseInteractiveStoryPath,
  completeInteractiveStoryPath,
  createInteractiveStory,
  deleteInteractiveStory,
  getCurrentUserInteractiveStories,
  getInteractiveStory,
} from '../controllers/interactiveStory.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { generationRateLimit } from '../middlewares/rateLimit.middleware.js';
import {
  chooseInteractiveStoryPathSchema,
  completeInteractiveStoryPathSchema,
  createInteractiveStorySchema,
  interactiveStoryIdParamSchema,
} from '../validations/interactiveStory.validation.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  generationRateLimit,
  validate(createInteractiveStorySchema),
  createInteractiveStory
);
router.get('/me', getCurrentUserInteractiveStories);
router.get(
  '/:storyId',
  validate(interactiveStoryIdParamSchema),
  getInteractiveStory
);
router.post(
  '/:storyId/choices',
  generationRateLimit,
  validate(chooseInteractiveStoryPathSchema),
  chooseInteractiveStoryPath
);
router.post(
  '/:storyId/complete',
  generationRateLimit,
  validate(completeInteractiveStoryPathSchema),
  completeInteractiveStoryPath
);
router.delete(
  '/:storyId',
  validate(interactiveStoryIdParamSchema),
  deleteInteractiveStory
);

export default router;
