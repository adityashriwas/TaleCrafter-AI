import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as classicSchema from './schema.js';
import * as interactiveSchema from './schemaV2.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for the backend API');
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema: classicSchema });
export const dbV2 = drizzle(sql, { schema: interactiveSchema });
