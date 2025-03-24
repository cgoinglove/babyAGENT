import { defineConfig } from 'vitest/config';

import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['__test__/**/*.ts'],
    testTimeout: 300000,
    setupFiles: ['./vitest.setup.ts'],
  },
});
