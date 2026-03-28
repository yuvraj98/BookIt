import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ DATABASE_URL missing from .env')
    process.exit(1)
  }

  console.log('🔗 Connecting to Supabase Postgres...')
  const client = new Client({
    connectionString: dbUrl,
  })

  try {
    await client.connect()
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'src', 'db', '003_sprint3_bookings.sql')
    console.log(`📄 Reading SQL from ${sqlPath}`)
    const sqlScript = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('⏳ Executing queries...')
    const res = await client.query(sqlScript)
    console.log('✅ Migration applied successfully!', res[res.length - 1]?.rows || 'Done.')
    
  } catch (err) {
    console.error('❌ Error executing migration:', err)
  } finally {
    await client.end()
    console.log('🔌 Disconnected.')
  }
}

runMigration()
