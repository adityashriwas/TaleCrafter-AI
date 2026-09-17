import { rateLimit } from 'express-rate-limit';

const common = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again later.',
    errors: [],
  },
};

export const apiRateLimit = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

export const generationRateLimit = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});

export const checkoutRateLimit = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 20,
});
