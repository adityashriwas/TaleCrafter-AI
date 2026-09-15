import { Router } from 'express';
import ApiResponse from '../utils/ApiResponse.js';

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

export default router;
