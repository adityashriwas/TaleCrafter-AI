import { randomUUID } from 'node:crypto';

export const attachRequestId = (req, res, next) => {
  const incoming = String(req.get('x-request-id') ?? '').trim();
  req.requestId = incoming.slice(0, 128) || randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
};
