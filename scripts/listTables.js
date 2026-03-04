const { neon } = require('@neondatabase/serverless');

async function main() {
  const url = process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_DATABASE_URL is missing');
  }

  const sql = neon(url);
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name;
  `;

  for (const row of rows) {
    console.log(row.table_name);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
