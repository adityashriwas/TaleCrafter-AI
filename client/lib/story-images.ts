import { apiFetch } from './api-client';


export type PollinationsImageOptions = {
  seed?: string | number;
  width?: number;
  height?: number;
};

const POLLINATIONS_MAX_SEED = 2147483647;

const normalizeSeed = (seed: string | number | undefined) => {
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

export const isPollinationsImageUrl = (url: string | null | undefined) => {
  if (!url) return false;
  return /^https?:\/\/(gen|image)\.pollinations\.ai\/image\//i.test(url);
};

// Public fallback for old stories that do not have persisted images yet.
// New generation flows should use createPollinationsImageUrl so provider keys stay backend-only.
export const buildPollinationsImageUrl = (
  prompt: string,
  options: PollinationsImageOptions = {}
) => {
  const normalizedPrompt = String(prompt ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 600);

  const safePrompt = encodeURIComponent(
    normalizedPrompt || 'storybook illustration'
  );
  const params = new URLSearchParams({
    model: 'flux',
    enhance: 'false',
    negative_prompt: 'worst quality, blurry',
    safe: 'false',
    seed: String(normalizeSeed(options.seed)),
  });

  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));

  return `https://gen.pollinations.ai/image/${safePrompt}?${params.toString()}`;
};

export const createPollinationsImageUrl = async (
  prompt: string,
  options: PollinationsImageOptions = {},
  token?: string | null
) => {
  const data = await apiFetch<{ imageUrl: string }>('/images/pollinations-url', {
    method: 'POST',
    token,
    body: JSON.stringify({ prompt, ...options }),
  });

  return data.imageUrl;
};

export const persistImageUrl = async (imageUrl: string, token?: string | null) => {
  const data = await apiFetch<{ secureUrl?: string; dataUrl?: string }>(
    '/images/persist',
    {
      method: 'POST',
      token,
      body: JSON.stringify({ imageUrl }),
    }
  );

  return String(data?.secureUrl ?? data?.dataUrl ?? imageUrl);
};
