import path from "path";
import { defineConfig } from "vitest/config";

/** Run example tests separately: npm run test:examples */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/examples/**/*.example.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
