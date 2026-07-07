import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    modules: "src/modules.ts",
  },
  clean: true,
  deps: {
    neverBundle: [
      // Peer dependencies
      "eslint",
      "typescript",

      // All plugin dependencies: npm installs them, no need to bundle
      /^eslint-plugin-/,
      /^@eslint\//,
      /^@eslint-react\//,
      /^@typescript-eslint\//,
      /^@cspell\//,
      /^@vitest\//,
      /^@oxlint\//,
      "globals",
      "typescript-eslint",
      "eslint-config-prettier",
    ],
  },
  dts: true,
  fixedExtension: false,
  format: ["esm"],
  outDir: "dist",
  platform: "node",
  sourcemap: true,
  target: "node22",
})
