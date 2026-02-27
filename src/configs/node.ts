import globals from "globals"

import type { FlatConfigArray } from "../types.ts"

/**
 * Node.js config — rules for server-side JavaScript/TypeScript.
 * Hand-picked subset of eslint-plugin-n. We don't use the full preset because
 * module resolution rules (`no-missing-import`, `no-unpublished-import`) are
 * handled better by TypeScript.
 *
 * @see https://github.com/eslint-community/eslint-plugin-n#-rules
 */
export function nodeConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/node",
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
      plugins: {
        get n() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-n")
        },
      },
      rules: {
        // Detect usage of deprecated Node.js APIs (fs.exists, url.parse, etc.)
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-deprecated-api.md
        "n/no-deprecated-api": "error",

        // Prevent `module.exports = ...` assignment in ES modules
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-exports-assign.md
        "n/no-exports-assign": "error",

        // OFF: TypeScript resolves imports — this rule has false positives
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-missing-import.md
        "n/no-missing-import": "off",

        // OFF: TypeScript resolves requires — this rule has false positives
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-missing-require.md
        "n/no-missing-require": "off",

        // Warn on process.exit() — prefer throwing errors for clean shutdown
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-process-exit.md
        "n/no-process-exit": "warn",

        // OFF: Too many false positives with monorepos and devDependencies
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-unpublished-import.md
        "n/no-unpublished-import": "off",

        // ── Prefer global builtins ────────────────────────────────────

        // Use global Buffer instead of require('buffer').Buffer
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/buffer.md
        "n/prefer-global/buffer": ["error", "always"],

        // Use global console — always available in Node.js
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/console.md
        "n/prefer-global/console": ["error", "always"],

        // Use global process — always available in Node.js
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/process.md
        "n/prefer-global/process": ["error", "always"],

        // Use global URL — available since Node.js 10
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/url.md
        "n/prefer-global/url": ["error", "always"],

        // Use global URLSearchParams — available since Node.js 10
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-global/url-search-params.md
        "n/prefer-global/url-search-params": ["error", "always"],

        // ── Prefer promise-based APIs ─────────────────────────────────

        // Use dns.promises instead of callback-based dns — modern async
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-promises/dns.md
        "n/prefer-promises/dns": "error",

        // Use fs.promises instead of callback-based fs — modern async
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/prefer-promises/fs.md
        "n/prefer-promises/fs": "error",
      },
    },
  ]
}
