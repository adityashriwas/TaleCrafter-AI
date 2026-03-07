type PollinationsImageOptions = {
  seed?: string | number;
  width?: number;
  height?: number;
};

const POLLINATIONS_MAX_SEED = 2147483647;

const normalizeSeed = (seed: string | number | undefined) => {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    const asInt = Math.floor(Math.abs(seed));
    return asInt % POLLINATIONS_MAX_SEED;
  }

  const raw = String(seed ?? "0");
  const digitsOnly = raw.replace(/\D+/g, "");
  if (!digitsOnly) return 0;

  // Use the last digits to avoid big-int parsing and keep deterministic behavior.
  const reduced = Number(digitsOnly.slice(-9));
  if (!Number.isFinite(reduced)) return 0;

  return Math.floor(Math.abs(reduced)) % POLLINATIONS_MAX_SEED;
};

export const isPollinationsImageUrl = (url: string | null | undefined) => {
  if (!url) return false;
  return /https?:\/\/(gen|image)\.pollinations\.ai\/image\//i.test(url);
};

export const buildPollinationsImageUrl = (
  prompt: string,
  options: PollinationsImageOptions = {}
) => {
  const normalizedPrompt = String(prompt ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 600);

  const safePrompt = encodeURIComponent(normalizedPrompt || "storybook illustration");
  const params = new URLSearchParams({
    model: process.env.NEXT_PUBLIC_POLLINATIONS_AI_MODEL ?? "flux",
    enhance: "false",
    negative_prompt: "worst quality, blurry",
    safe: "false",
    seed: String(normalizeSeed(options.seed)),
    key: process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY ?? "",
  });

  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));

  return `https://gen.pollinations.ai/image/${safePrompt}?${params.toString()}`;
};

export const persistImageUrl = async (imageUrl: string) => {
  const response = await fetch("/api/persist-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error("Unable to persist image");
  }

  const data = await response.json();
  return String(data?.secureUrl ?? data?.dataUrl ?? imageUrl);
};