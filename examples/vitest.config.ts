import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["__test__/**/*.ts"],
    testTimeout: 300000,
    setupFiles: ["./vitest.setup.ts"],
  },
});
