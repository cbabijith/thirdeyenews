import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests', testMatch: 'team.spec.ts', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'node tests/mock-supabase.mjs', port: 54329, reuseExistingServer: false },
    { command: 'pnpm exec next dev -p 3100', url: 'http://localhost:3100/login', reuseExistingServer: false, timeout: 120000,
      env: { NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54329', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key', SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key', DATABASE_URL: 'postgres://test:test@127.0.0.1:54328/test' } },
  ],
})
