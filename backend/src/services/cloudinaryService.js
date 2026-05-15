const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/apiError');

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function normalizeImage(imageData) {
  if (!imageData) return null;
  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    return imageData;
  }
  const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const optimized = await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${optimized.toString('base64')}`;
}

async function uploadImage(imageData, folder = 'temple/uploads') {
  if (!imageData) {
    throw new ApiError(400, 'Image is required');
  }

  if (Buffer.isBuffer(imageData)) {
    const optimized = await sharp(imageData)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    const result = await uploadBuffer(optimized, folder);
    return { image_url: result.secure_url, public_id: result.public_id };
  }

  const normalized = await normalizeImage(imageData);
  const result = await cloudinary.uploader.upload(normalized, {
    folder,
    resource_type: 'image'
  });
  return { image_url: result.secure_url, public_id: result.public_id };
}

module.exports = { uploadImage };
