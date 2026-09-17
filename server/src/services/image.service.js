import { v2 as cloudinary } from 'cloudinary';
import ApiError from '../utils/ApiError.js';

const POLLINATIONS_MAX_SEED = 2147483647;
const MAX_SOURCE_IMAGE_BYTES = 15 * 1024 * 1024;

const normalizeSeed = seed => {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    const asInt = Math.floor(Math.abs(seed));
    return asInt % POLLINATIONS_MAX_SEED;
  }

  const raw = String(seed ?? '0');
  const digitsOnly = raw.replace(/\D+/g, '');
  if (!digitsOnly) return 0;

  const reduced = Number(digitsOnly.slice(-9));
  if (!Number.isFinite(reduced)) return 0;

  return Math.floor(Math.abs(reduced)) % POLLINATIONS_MAX_SEED;
};

export const isPollinationsImageUrl = url => {
  if (!url) return false;
  return /^https?:\/\/(gen|image)\.pollinations\.ai\/image\//i.test(url);
};

export const buildPollinationsImageUrl = (prompt, options = {}) => {
  const normalizedPrompt = String(prompt ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 600);

  const safePrompt = encodeURIComponent(
    normalizedPrompt || 'storybook illustration'
  );
  const params = new URLSearchParams({
    model: process.env.POLLINATIONS_AI_MODEL ?? 'flux',
    enhance: 'false',
    negative_prompt: 'worst quality, blurry',
    safe: 'true',
    seed: String(normalizeSeed(options.seed)),
  });

  if (process.env.POLLINATIONS_API_KEY) {
    params.set('key', process.env.POLLINATIONS_API_KEY);
  }

  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));

  return `https://gen.pollinations.ai/image/${safePrompt}?${params.toString()}`;
};

const fetchWithTimeout = async (url, init, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_STORY_FOLDER ?? 'talecrafter/stories';

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
    configured: Boolean(cloudName && apiKey && apiSecret),
  };
};

export const isCloudinaryConfigured = () => getCloudinaryConfig().configured;

export const uploadImageToCloudinary = async (imageUrl, options = {}) => {
  const { cloudName, apiKey, apiSecret, folder, configured } =
    getCloudinaryConfig();

  if (!configured || !cloudName || !apiKey || !apiSecret) {
    throw new ApiError(503, 'Cloudinary is not configured');
  }

  const safeUrl = String(imageUrl ?? '').trim();

  if (!isPollinationsImageUrl(safeUrl)) {
    throw new ApiError(400, 'Only Pollinations image URLs are supported');
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signatureParams = {
    folder: options.folder ?? folder,
    overwrite: 'false',
    timestamp,
    unique_filename: 'true',
  };

  if (options.publicId) {
    signatureParams.public_id = options.publicId;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const signature = cloudinary.utils.api_sign_request(
    signatureParams,
    apiSecret
  );
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  const sourceResp = await fetchWithTimeout(
    safeUrl,
    { cache: 'no-store', redirect: 'error' },
    options.sourceTimeoutMs ?? 70000
  );

  if (!sourceResp.ok) {
    throw new ApiError(502, `Image source fetch failed: ${sourceResp.status}`);
  }

  const contentType = sourceResp.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new ApiError(400, 'Source URL did not return an image');
  }

  const contentLength = Number(sourceResp.headers.get('content-length') ?? 0);
  if (contentLength > MAX_SOURCE_IMAGE_BYTES) {
    throw new ApiError(413, 'Source image is too large');
  }

  const arrayBuffer = await sourceResp.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_SOURCE_IMAGE_BYTES) {
    throw new ApiError(413, 'Source image is too large');
  }
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUri = `data:${contentType};base64,${base64}`;

  formData.append('file', dataUri);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', signatureParams.folder);
  formData.append('resource_type', 'image');
  formData.append('unique_filename', signatureParams.unique_filename);
  formData.append('overwrite', signatureParams.overwrite);

  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    },
    options.uploadTimeoutMs ?? 30000
  );

  if (!response.ok) {
    throw new ApiError(502, `Cloudinary upload failed: ${response.status}`);
  }

  const payload = await response.json();
  return {
    secureUrl: String(payload?.secure_url ?? ''),
    publicId: String(payload?.public_id ?? ''),
    bytes: Number(payload?.bytes ?? 0),
    format: String(payload?.format ?? ''),
  };
};
