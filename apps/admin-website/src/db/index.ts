import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

const globalForDb = globalThis as unknown as { db: ReturnType<typeof createDb> }

function createDb() {
  // In serverless/production environments, limit the connection pool size to 1.
  // Serverless functions process one request at a time, so max: 1 is recommended
  // to avoid saturating connection limits and raising compute CPU load.
  const isProd = process.env.NODE_ENV === 'production'
  const client = postgres(connectionString, {
    max: isProd ? 1 : 10,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  })
  return drizzle(client, { schema })
}

// Cache the db connection globally in both development AND production.
// Vercel serverless containers persist global state between warm invocations.
export const db = globalForDb.db ?? createDb()
globalForDb.db = db
export { schema }
