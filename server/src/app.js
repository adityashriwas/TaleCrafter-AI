import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';
import { API_PREFIX } from './constants.js';
import ApiError from './utils/ApiError.js';
import { attachRequestId } from './middlewares/request.middleware.js';
import { apiRateLimit } from './middlewares/rateLimit.middleware.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import healthRouter from './routes/health.route.js';
import userRouter from './routes/user.route.js';
import aiRouter from './routes/ai.route.js';
import imageRouter from './routes/image.route.js';
import storyRouter from './routes/story.route.js';
import interactiveStoryRouter from './routes/interactiveStory.route.js';
import paymentRouter from './routes/payment.route.js';
import { handleStripeWebhook } from './controllers/payment.controller.js';
import adminRouter from './routes/admin.route.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(attachRequestId);
app.use(helmet());

const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  : [];

const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const allowedOrigins = new Set([...configuredOrigins, ...devOrigins]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(403, 'Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.post(
  `${API_PREFIX}/payments/stripe/webhook`,
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(API_PREFIX, apiRateLimit);

app.use(`${API_PREFIX}/health`, healthRouter);

app.use(clerkMiddleware());

app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/ai`, aiRouter);
app.use(`${API_PREFIX}/images`, imageRouter);
app.use(`${API_PREFIX}/stories`, storyRouter);
app.use(`${API_PREFIX}/interactive-stories`, interactiveStoryRouter);
app.use(`${API_PREFIX}/payments`, paymentRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
