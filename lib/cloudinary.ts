import { v2 as cloudinary } from "cloudinary";

type CloudinaryUploadOptions = {
  folder?: string;
  publicId?: string;
  sourceTimeoutMs?: number;
  uploadTimeoutMs?: number;
};

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number) => {
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
  const folder = process.env.CLOUDINARY_STORY_FOLDER ?? "talecrafter/stories";

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
    configured: Boolean(cloudName && apiKey && apiSecret),
  };
};

export const isCloudinaryConfigured = () => getCloudinaryConfig().configured;

export const isCloudinaryUrl = (url: string | null | undefined) => {
  if (!url) return false;
  return /https?:\/\/res\.cloudinary\.com\//i.test(url);
};

export const uploadImageToCloudinary = async (
  imageUrl: string,
  options: CloudinaryUploadOptions = {}
) => {
  const { cloudName, apiKey, apiSecret, folder, configured } = getCloudinaryConfig();

  if (!configured || !cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signatureParams: Record<string, string> = {
    folder: options.folder ?? folder,
    overwrite: "false",
    timestamp,
    unique_filename: "true",
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

  const signature = cloudinary.utils.api_sign_request(signatureParams, apiSecret);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  const sourceResp = await fetchWithTimeout(
    imageUrl,
    { cache: "no-store" },
    options.sourceTimeoutMs ?? 70000
  );
  if (!sourceResp.ok) {
    throw new Error(`Image source fetch failed: ${sourceResp.status}`);
  }

  const contentType = sourceResp.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error("Source URL did not return an image");
  }

  const arrayBuffer = await sourceResp.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;

  formData.append("file", dataUri);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", signatureParams.folder);
  formData.append("resource_type", "image");
  formData.append("unique_filename", signatureParams.unique_filename);
  formData.append("overwrite", signatureParams.overwrite);

  if (options.publicId) {
    formData.append("public_id", options.publicId);
  }

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      body: formData,
      cache: "no-store",
    },
    options.uploadTimeoutMs ?? 30000
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const payload = await response.json();
  return {
    secureUrl: String(payload?.secure_url ?? ""),
    publicId: String(payload?.public_id ?? ""),
    bytes: Number(payload?.bytes ?? 0),
    format: String(payload?.format ?? ""),
  };
};