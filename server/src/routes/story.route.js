import { Router } from 'express';
import {
  createStory,
  deleteStory,
  getCurrentUserStories,
  getPublicStories,
  getRelatedStoryList,
  getStoryIdDetail,
  getStorySitemapEntries,
  getStorySitemapPage,
  getStorySlugDetail,
} from '../controllers/story.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { generationRateLimit } from '../middlewares/rateLimit.middleware.js';
import {
  createStorySchema,
  relatedStoriesQuerySchema,
  storyIdParamSchema,
} from '../validations/story.validation.js';

const router = Router();

router.get('/', getPublicStories);
router.post(
  '/',
  generationRateLimit,
  requireAuth,
  validate(createStorySchema),
  createStory
);
router.get('/me', requireAuth, getCurrentUserStories);
router.get('/sitemap', getStorySitemapEntries);
router.get('/sitemap/page', getStorySitemapPage);
router.get('/slug/:slug', getStorySlugDetail);
router.get('/id/:storyId', getStoryIdDetail);
router.get(
  '/:storyId/related',
  validate(relatedStoriesQuerySchema),
  getRelatedStoryList
);
router.delete(
  '/:storyId',
  requireAuth,
  validate(storyIdParamSchema),
  deleteStory
);

export default router;
