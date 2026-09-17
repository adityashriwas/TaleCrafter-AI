import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const sql = neon(connectionString);
const migrationsDir = fileURLToPath(
  new URL('../src/db/migrations/', import.meta.url)
);

const splitStatements = source =>
  source
    .split(';')
    .map(statement => statement.replace(/^\s*--.*$/gm, '').trim())
    .filter(Boolean);

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name varchar(255) PRIMARY KEY,
    checksum varchar(64) NOT NULL,
    "appliedAt" timestamp NOT NULL DEFAULT now()
  )
`;

const appliedRows = await sql`SELECT name, checksum FROM schema_migrations`;
const applied = new Map(appliedRows.map(row => [row.name, row.checksum]));
const files = (await readdir(migrationsDir))
  .filter(name => name.endsWith('.sql'))
  .sort();

for (const name of files) {
  const source = await readFile(path.join(migrationsDir, name), 'utf8');
  const checksum = createHash('sha256').update(source).digest('hex');
  const existingChecksum = applied.get(name);

  if (existingChecksum) {
    if (existingChecksum !== checksum) {
      throw new Error(`Applied migration was modified: ${name}`);
    }
    console.log(`skip ${name}`);
    continue;
  }

  const statements = splitStatements(source);
  const queries = statements.map(statement => sql.query(statement, []));
  queries.push(
    sql`INSERT INTO schema_migrations (name, checksum) VALUES (${name}, ${checksum})`
  );

  await sql.transaction(queries);
  console.log(`applied ${name}`);
}
