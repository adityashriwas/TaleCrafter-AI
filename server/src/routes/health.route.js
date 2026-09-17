import { Router } from 'express';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      service: 'talecrafter-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  );
});

router.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    await db.execute(sql`SELECT 1`);
    res.status(200).json(
      new ApiResponse(200, {
        service: 'talecrafter-api',
        status: 'ready',
        timestamp: new Date().toISOString(),
      })
    );
  })
);

export default router;
