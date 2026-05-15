const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { uploadImage } = require('../services/cloudinaryService');

exports.uploadImage = asyncHandler(async (req, res) => {
  const folder = req.body.folder || 'temple/uploads';
  const file = req.file || req.files?.[0];
  const imageSource = file?.buffer || req.body.image_data;

  if (!imageSource) {
    throw new ApiError(400, 'Image is required');
  }

  const result = await uploadImage(imageSource, folder);
  res.status(201).json(result);
});
