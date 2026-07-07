const fs = require('fs')
const path = require('path')

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
envContent.split('\n').forEach(line => {
  const i = line.indexOf('=')
  if (i > 0) {
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
})

async function main() {
  const postgres = (await import('postgres')).default
  const DATABASE_URL = process.env.DATABASE_URL
  console.log('DATABASE_URL:', DATABASE_URL?.substring(0, 60) + '...')

  // Test 1: Basic connection
  console.log('\n1. Basic connection test...')
  const sql = postgres(DATABASE_URL, { max: 1, prepare: false })
  try {
    const result = await sql`SELECT 1 as test`
    console.log('   Connection OK:', result)
  } catch (e) {
    console.error('   Connection FAILED:', e.message)
  }

  // Test 2: Check tables
  console.log('\n2. Checking tables...')
  try {
    const tables = await sql`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `
    console.log('   Tables:', tables.map(t => t.tablename))
  } catch (e) {
    console.error('   FAILED:', e.message)
  }

  // Test 3: Query categories
  console.log('\n3. Querying categories...')
  try {
    const cats = await sql`
      SELECT id, name, slug, description, icon, created_at, updated_at
      FROM categories
      ORDER BY name ASC
    `
    console.log('   Categories:', cats.length, 'rows')
  } catch (e) {
    console.error('   FAILED:', e.message)
    console.error('   Code:', e.code)
  }

  // Test 4: Check if user_role enum exists
  console.log('\n4. Checking enums...')
  try {
    const enums = await sql`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY t.typname, e.enumsortorder
    `
    console.log('   Enums:', enums.map(e => `${e.typname}.${e.enumlabel}`))
  } catch (e) {
    console.error('   FAILED:', e.message)
  }

  // Test 5: Check columns on categories table
  console.log('\n5. Checking categories table columns...')
  try {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'categories' AND table_schema = 'public'
      ORDER BY ordinal_position
    `
    console.log('   Columns:', cols.map(c => `${c.column_name} (${c.data_type})`))
  } catch (e) {
    console.error('   FAILED:', e.message)
  }

  // Test 6: Connection timing
  console.log('\n6. Connection timing test...')
  const start = Date.now()
  try {
    await sql`SELECT 1`
    console.log('   Query time:', Date.now() - start, 'ms')
  } catch (e) {
    console.error('   FAILED:', e.message)
  }

  // Test 7: Multiple queries timing
  console.log('\n7. Multiple queries timing...')
  const start2 = Date.now()
  try {
    await Promise.all([
      sql`SELECT * FROM categories ORDER BY name ASC`,
      sql`SELECT * FROM subcategories ORDER BY name ASC`,
      sql`SELECT * FROM news ORDER BY created_at DESC LIMIT 10`,
      sql`SELECT COUNT(*) FROM news`,
    ])
    console.log('   4 parallel queries time:', Date.now() - start2, 'ms')
  } catch (e) {
    console.error('   FAILED:', e.message)
  }

  await sql.end()
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
