import { Router } from 'express';
import {
  chooseInteractiveStoryPath,
  completeInteractiveStoryPath,
  createInteractiveStory,
  getInteractiveStory,
} from '../controllers/interactiveStory.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', createInteractiveStory);
router.get('/:storyId', getInteractiveStory);
router.post('/:storyId/choices', chooseInteractiveStoryPath);
router.post('/:storyId/complete', completeInteractiveStoryPath);

export default router;
