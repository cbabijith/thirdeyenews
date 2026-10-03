import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

const globalForDb = globalThis as unknown as { db: ReturnType<typeof createDb> }

function createDb() {
  // Each serverless instance owns a pool. Keep the total connection footprint small.
  const poolSize = Number(process.env.DB_POOL_MAX || 5)
  const client = postgres(connectionString, {
    max: Number.isInteger(poolSize) && poolSize > 0 && poolSize <= 20 ? poolSize : 5,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 5,
    max_lifetime: 300,
    connection: {
      application_name: 'thirdeyenews-admin',
      statement_timeout: 10000,
      lock_timeout: 3000,
    },
  })
  return drizzle(client, { schema })
}

// Cache the db connection globally in both development AND production.
// Vercel serverless containers persist global state between warm invocations.
export const db = globalForDb.db ?? createDb()
globalForDb.db = db
export { schema }
