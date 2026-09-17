import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../src/config/env.js';

const baseEnvironment = {
  NODE_ENV: 'development',
  PORT: '8000',
  DATABASE_URL: 'postgresql://user:password@example.com/database',
  CLERK_SECRET_KEY: 'sk_test_clerk',
};

test('accepts a valid development environment', () => {
  const env = validateEnvironment(baseEnvironment);
  assert.equal(env.PORT, 8000);
  assert.equal(env.NODE_ENV, 'development');
});

test('rejects an invalid client origin', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...baseEnvironment,
        CLIENT_ORIGIN: 'javascript:alert(1)',
      }),
    /CLIENT_ORIGIN/
  );
});

test('requires service configuration in production', () => {
  assert.throws(
    () => validateEnvironment({ ...baseEnvironment, NODE_ENV: 'production' }),
    /STRIPE_SECRET_KEY is required in production/
  );
});
