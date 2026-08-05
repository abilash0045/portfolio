import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["contract/**/*.test.ts"],
    environment: "node",
    testTimeout: 30_000,
    passWithNoTests: true,
  },
});
