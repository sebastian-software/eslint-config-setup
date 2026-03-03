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
  target: "node22",
  outDir: "dist",
  external: [
    // Peer dependencies
    "eslint",
    "typescript",

    // All plugin dependencies — npm installs them, no need to bundle
    /^eslint-plugin-/,
    /^@eslint\//,
    /^@typescript-eslint\//,
    /^@cspell\//,
    /^@vitest\//,
    /^@oxlint\//,
    "globals",
    "typescript-eslint",
    "eslint-config-prettier",
  ],
})
