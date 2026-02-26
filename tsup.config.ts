import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    modules: "src/modules.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node20",
  outDir: "dist",
  external: [
    "eslint",
    "typescript",
  ],
})
