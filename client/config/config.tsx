import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
const connectionString = process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL;
if (!connectionString) {
	throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
}
const sql = neon(connectionString);
export const db = drizzle(sql, {schema});