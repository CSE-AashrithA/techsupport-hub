import { defineConfig } from "vitest/config";

// tests get their own database so they never touch your real data.
// set here (before any test file loads) so src/db.ts connects to it.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://localhost:5432/techsupport_hub_test";

export default defineConfig({
  test: {
    globalSetup: ["./tests/global-setup.ts"],
    // test files share one database, so run them one at a time
    fileParallelism: false,
  },
});
