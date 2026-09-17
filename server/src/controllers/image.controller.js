import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  buildPollinationsImageUrl,
  uploadImageToCloudinary,
} from '../services/image.service.js';

export const createPollinationsImageUrl = asyncHandler(async (req, res) => {
  const imageUrl = buildPollinationsImageUrl(req.validated.body.prompt, {
    seed: req.validated.body.seed,
    width: req.validated.body.width,
    height: req.validated.body.height,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { imageUrl }, 'Image URL generated'));
});

export const persistImage = asyncHandler(async (req, res) => {
  const uploadResult = await uploadImageToCloudinary(
    req.validated.body.imageUrl
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        dataUrl: uploadResult.secureUrl,
        secureUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        bytes: uploadResult.bytes,
      },
      'Image persisted successfully'
    )
  );
});
