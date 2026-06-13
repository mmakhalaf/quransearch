import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests. Boots the dev server and drives a real browser.
 * In CI, run `npx playwright install --with-deps chromium` first.
 */
export default defineConfig({
   testDir: './e2e',
   timeout: 60_000,
   expect: { timeout: 15_000 },
   fullyParallel: false,
   retries: process.env.CI ? 1 : 0,
   workers: 1,
   reporter: process.env.CI ? 'list' : 'line',
   use: {
      baseURL: 'http://localhost:4200',
      trace: 'on-first-retry'
   },
   projects: [
      {
         name: 'chromium',
         use: {
            ...devices['Desktop Chrome'],
            // Allow pointing at a pre-installed Chrome for local runs where the
            // Playwright browser download is unavailable. CI uses the bundled one.
            launchOptions: process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {}
         }
      }
   ],
   webServer: {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000
   }
});
