import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createClassicStory,
  deleteCurrentUserStory,
  getStoryBySlug,
  getStoryByStoryId,
  listCurrentUserStories,
  listPublicStories,
  listRelatedStories,
  listStorySitemapEntries,
  listStorySitemapPage,
} from '../services/story.service.js';
import ApiError from '../utils/ApiError.js';

export const getPublicStories = asyncHandler(async (req, res) => {
  const stories = await listPublicStories(req.query ?? {});
  return res.status(200).json(new ApiResponse(200, stories, 'Stories fetched'));
});

export const getCurrentUserStories = asyncHandler(async (req, res) => {
  const stories = await listCurrentUserStories({
    userId: req.auth.userId,
    ...req.query,
  });
  return res.status(200).json(new ApiResponse(200, stories, 'Stories fetched'));
});

export const getStorySlugDetail = asyncHandler(async (req, res) => {
  const story = await getStoryBySlug(req.params.slug);
  if (!story) throw new ApiError(404, 'Story not found');
  return res.status(200).json(new ApiResponse(200, story, 'Story fetched'));
});

export const getStoryIdDetail = asyncHandler(async (req, res) => {
  const story = await getStoryByStoryId(req.params.storyId);
  if (!story) throw new ApiError(404, 'Story not found');
  return res.status(200).json(new ApiResponse(200, story, 'Story fetched'));
});

export const getStorySitemapEntries = asyncHandler(async (_req, res) => {
  const stories = await listStorySitemapEntries();
  return res.status(200).json(new ApiResponse(200, stories, 'Stories fetched'));
});

export const getStorySitemapPage = asyncHandler(async (req, res) => {
  const stories = await listStorySitemapPage({
    limit: req.query.limit,
    offset: req.query.offset,
  });
  return res.status(200).json(new ApiResponse(200, stories, 'Stories fetched'));
});

export const getRelatedStoryList = asyncHandler(async (req, res) => {
  const result = await listRelatedStories({
    storyId: req.params.storyId,
    storyType: req.query.storyType,
    limit: req.query.limit,
    offset: req.query.offset,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Related stories fetched'));
});

export const deleteStory = asyncHandler(async (req, res) => {
  const story = await deleteCurrentUserStory({
    userId: req.auth.userId,
    storyId: req.params.storyId,
  });
  return res.status(200).json(new ApiResponse(200, story, 'Story deleted'));
});

export const createStory = asyncHandler(async (req, res) => {
  const story = await createClassicStory({
    userId: req.auth.userId,
    payload: req.validated.body,
  });

  return res.status(201).json(new ApiResponse(201, story, 'Story created'));
});
