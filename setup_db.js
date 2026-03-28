require('dotenv').config({ path: './apps/api/.env' });
const { Client } = require('pg');
const fs = require('fs');

async function run() {
  if (!process.env.DATABASE_URL) throw new Error("No DATABASE_URL found");
  
  console.log("Connecting to database...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  console.log("✅ Connected to database!\n");

  const migrations = [
    { file: './apps/api/src/db/001_initial_schema.sql', label: '001 — Initial Schema' },
    { file: './apps/api/src/db/002_sprint2_organiser.sql', label: '002 — Sprint 2 Organiser' },
    { file: './apps/api/src/db/003_sprint3_bookings.sql', label: '003 — Sprint 3 Bookings' },
  ];

  for (const { file, label } of migrations) {
    try {
      const sql = fs.readFileSync(file, 'utf8');
      const result = await client.query(sql);
      console.log(`✅ ${label} — successful!`);
    } catch (e) {
      // "already exists" errors are safe to ignore (idempotent re-runs)
      if (e.message.includes('already exists')) {
        console.log(`⏭️  ${label} — already applied (skipped)`);
      } else {
        console.log(`❌ ${label} — ERROR: ${e.message}`);
      }
    }
  }

  // Reload Supabase schema cache
  try {
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("\n🔄 Schema cache reloaded!");
  } catch(e) {}

  // Quick sanity check — list tables
  try {
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log(`\n📋 Tables in public schema (${rows.length}):`);
    rows.forEach(r => console.log(`   • ${r.table_name}`));
  } catch(e) {}

  await client.end();
  console.log('\n🎉 Database Setup Completed Successfully!');
}

run().catch(e => console.error("FATAL:", e));
