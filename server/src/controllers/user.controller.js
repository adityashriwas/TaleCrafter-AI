import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { syncUserFromClerk } from '../services/user.service.js';

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await syncUserFromClerk(req.auth.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Current user fetched successfully'));
});
