import { z } from 'zod';

const optionalString = z.string().trim().optional();

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL is required'),
  CLERK_SECRET_KEY: z.string().trim().min(1, 'CLERK_SECRET_KEY is required'),
  CORS_ORIGIN: optionalString,
  CLIENT_ORIGIN: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  GEMINI_API_KEY: optionalString,
  POLLINATIONS_API_KEY: optionalString,
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
});

const productionRequired = [
  'CORS_ORIGIN',
  'CLIENT_ORIGIN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GEMINI_API_KEY',
  'POLLINATIONS_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const isHttpUrl = value => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateEnvironment = (source = process.env) => {
  const result = environmentSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid server environment: ${details}`);
  }

  const env = result.data;
  const issues = [];

  if (env.NODE_ENV === 'production') {
    for (const name of productionRequired) {
      if (!env[name]) issues.push(`${name} is required in production`);
    }
  }

  const origins = String(env.CORS_ORIGIN ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  if (origins.some(origin => !isHttpUrl(origin))) {
    issues.push('CORS_ORIGIN must contain comma-separated http(s) URLs');
  }

  if (env.CLIENT_ORIGIN && !isHttpUrl(env.CLIENT_ORIGIN)) {
    issues.push('CLIENT_ORIGIN must be an http(s) URL');
  }

  if (
    env.STRIPE_SECRET_KEY &&
    !/^[sr]k_(test|live)_/.test(env.STRIPE_SECRET_KEY)
  ) {
    issues.push('STRIPE_SECRET_KEY has an invalid format');
  }

  if (
    env.STRIPE_WEBHOOK_SECRET &&
    !env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')
  ) {
    issues.push('STRIPE_WEBHOOK_SECRET has an invalid format');
  }

  if (issues.length) {
    throw new Error(`Invalid server environment: ${issues.join('; ')}`);
  }

  return env;
};
