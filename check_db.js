require('dotenv').config({ path: './apps/api/.env' });
const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  console.log('Tables in public schema:');
  rows.forEach(r => console.log('  -', r.table_name));

  // Check enum types
  const { rows: enums } = await client.query(`
    SELECT typname FROM pg_type 
    WHERE typcategory = 'E' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY typname;
  `);
  console.log('\nEnum types:');
  enums.forEach(r => console.log('  -', r.typname));

  // Check functions
  const { rows: funcs } = await client.query(`
    SELECT routine_name FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    ORDER BY routine_name;
  `);
  console.log('\nFunctions:');
  funcs.forEach(r => console.log('  -', r.routine_name));

  await client.end();
}
check().catch(e => console.error('Error:', e.message));
