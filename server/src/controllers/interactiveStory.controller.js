import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  completeInteractiveStory,
  continueInteractiveStory,
  createInteractiveStarter,
  deleteCurrentUserInteractiveStory,
  getCurrentUserInteractiveStory,
  listCurrentUserInteractiveStories,
} from '../services/interactiveStory.service.js';

export const createInteractiveStory = asyncHandler(async (req, res) => {
  const story = await createInteractiveStarter({
    userId: req.auth.userId,
    payload: req.validated.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, story, 'Interactive story created'));
});

export const getCurrentUserInteractiveStories = asyncHandler(
  async (req, res) => {
    const stories = await listCurrentUserInteractiveStories({
      userId: req.auth.userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, stories, 'Interactive stories fetched'));
  }
);

export const getInteractiveStory = asyncHandler(async (req, res) => {
  const story = await getCurrentUserInteractiveStory({
    userId: req.auth.userId,
    storyId: req.params.storyId,
  });

  return res.status(200).json(new ApiResponse(200, story));
});

export const chooseInteractiveStoryPath = asyncHandler(async (req, res) => {
  const story = await continueInteractiveStory({
    userId: req.auth.userId,
    storyId: req.params.storyId,
    selectedChoice:
      req.validated.body.selectedChoice ?? req.validated.body.choice,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, story, 'Interactive story continued'));
});

export const completeInteractiveStoryPath = asyncHandler(async (req, res) => {
  const story = await completeInteractiveStory({
    userId: req.auth.userId,
    storyId: req.params.storyId,
    selectedChoice:
      req.validated.body?.selectedChoice ??
      req.validated.body?.choice ??
      'End Story',
  });

  return res
    .status(200)
    .json(new ApiResponse(200, story, 'Interactive story completed'));
});

export const deleteInteractiveStory = asyncHandler(async (req, res) => {
  const story = await deleteCurrentUserInteractiveStory({
    userId: req.auth.userId,
    storyId: req.params.storyId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, story, 'Interactive story deleted'));
});
