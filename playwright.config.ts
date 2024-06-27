import { defineConfig, devices } from "@playwright/test";

const LOCAL_TEST_BASE_URL = "http://localhost:3000";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.PLAYWRIGHT_TEST_BASE_URL,
  /* Retry on CI only */
  retries: process.env.PLAYWRIGHT_TEST_BASE_URL ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.PLAYWRIGHT_TEST_BASE_URL ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || LOCAL_TEST_BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Moto G4",
      use: {
        ...devices["Moto G4"],
      },
    },
    {
      name: "iPhone 13 Pro",
      use: {
        ...devices["iPhone 13 Pro"],
      },
    },
    {
      name: "Desktop Safari",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
  expect: {
    timeout: 10000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.07,
    },
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.07,
    },
  },
  timeout: 30 * 1000,
});
