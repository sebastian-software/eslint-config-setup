import nodePlugin from "eslint-plugin-n"
import globals from "globals"

import type { FlatConfigArray } from "../types"

import { createConfig } from "../build/config-builder"

/**
 * Node.js config — rules for server-side JavaScript/TypeScript.
 * Hand-picked subset of eslint-plugin-n. We don't use the full preset because
 * module resolution rules (`no-missing-import`, `no-unpublished-import`) are
 * handled better by TypeScript.
 *
 * @see https://github.com/eslint-community/eslint-plugin-n#-rules
 */
export function nodeConfig(opts?: { ai?: boolean }): FlatConfigArray {
  const isAi = opts?.ai ?? false

  const builder = createConfig({
    name: "eslint-config-setup/node",
    presets: [
      {
        rules: {
          // Detect usage of deprecated Node.js APIs (fs.exists, url.parse, etc.)
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-deprecated-api.md
          "node/no-deprecated-api": "error",

          // Prevent `module.exports = ...` assignment in ES modules
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-exports-assign.md
          "node/no-exports-assign": "error",

          // OFF: TypeScript resolves imports — this rule has false positives
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-missing-import.md
          "node/no-missing-import": "off",

          // OFF: TypeScript resolves requires — this rule has false positives
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-missing-require.md
          "node/no-missing-require": "off",

          // Warn on process.exit() — prefer throwing errors for clean shutdown
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-process-exit.md
          "node/no-process-exit": "warn",

          // OFF: Too many false positives with monorepos and devDependencies
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-unpublished-import.md
          "node/no-unpublished-import": "off",

          // Validate hashbang lines — correct syntax, Unix linebreaks, only in entry files
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/hashbang.md
          "node/hashbang": "error",

          // Detect `__dirname + '/foo'` — use path.join() instead (breaks on Windows)
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-path-concat.md
          "node/no-path-concat": "error",

          // Treat process.exit() as throw — prevents false positives in unreachable code analysis
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/process-exit-as-throw.md
          "node/process-exit-as-throw": "error",

          // Ensure error parameters in callbacks are handled — don't silently swallow errors
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/handle-callback-err.md
          "node/handle-callback-err": "error",

          // ── Prefer global builtins ────────────────────────────────────

          // Use global Buffer instead of require('buffer').Buffer
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/buffer.md
          "node/prefer-global/buffer": ["error", "always"],

          // Use global console — always available in Node.js
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/console.md
          "node/prefer-global/console": ["error", "always"],

          // Use global process — always available in Node.js
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/process.md
          "node/prefer-global/process": ["error", "always"],

          // Use global URL — available since Node.js 10
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/url.md
          "node/prefer-global/url": ["error", "always"],

          // Use global URLSearchParams — available since Node.js 10
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/url-search-params.md
          "node/prefer-global/url-search-params": ["error", "always"],

          // ── Prefer promise-based APIs ─────────────────────────────────

          // Use dns.promises instead of callback-based dns — modern async
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-promises/dns.md
          "node/prefer-promises/dns": "error",

          // Use fs.promises instead of callback-based fs — modern async
          // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-promises/fs.md
          "node/prefer-promises/fs": "error",
        },
      },
    ],
    plugins: { node: nodePlugin },
    languageOptions: { globals: { ...globals.node } },
  })

  if (isAi) {
    builder.addRule("node/no-unsupported-features/node-builtins", "error")
  }

  return builder.build()
}
