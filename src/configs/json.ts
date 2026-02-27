import jsonPlugin from "@eslint/json"

import type { FlatConfigArray } from "../types.ts"

/**
 * JSON/JSONC config — native JSON linting using the official @eslint/json plugin.
 * Two blocks: strict JSON for most files, JSONC (with comments) for tsconfig etc.
 *
 * @see https://github.com/eslint/json#rules
 */
export function jsonConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/json",
      files: ["**/*.json"],
      ignores: ["**/package-lock.json"],
      language: "json/json",
      plugins: {
        json: jsonPlugin,
      },
      rules: {
        // Detect duplicate keys in JSON — last-write-wins is confusing
        // https://github.com/eslint/json#rules
        "json/no-duplicate-keys": "error",
      },
    },
    {
      name: "@effective/eslint/jsonc",
      files: [
        "**/tsconfig.json",
        "**/tsconfig.*.json",
        "**/.vscode/*.json",
        "**/turbo.json",
      ],
      language: "json/jsonc",
      plugins: {
        json: jsonPlugin,
      },
      rules: {
        // Detect duplicate keys in JSONC — same rationale as JSON
        // https://github.com/eslint/json#rules
        "json/no-duplicate-keys": "error",
      },
    },
  ]
}
