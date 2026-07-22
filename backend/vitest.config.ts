import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/{unit,api}/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/modules/utilities/**/*.ts",
        "src/modules/charges/**/*.ts",
        "src/modules/maintenance/service.ts",
        "src/modules/maintenance/photos.ts",
        "src/modules/maintenance/schema.ts",
        "src/modules/maintenance/upload.ts",
        "src/lib/storage.ts",
      ],
      exclude: ["**/controller.ts", "**/router.ts"],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 65,
        lines: 70,
      },
    },
  },
});
