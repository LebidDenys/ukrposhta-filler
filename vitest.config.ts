import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    environmentMatchGlobs: [
      ["tests/filler/**", "happy-dom"],
      ["tests/ui/**", "happy-dom"],
    ],
    globals: false,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/content/index.ts", "src/data/iso3166.ts", "src/data/dialCodes.ts"],
    },
  },
});
