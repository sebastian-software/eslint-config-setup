import jsonPlugin from "@eslint/json"

import type { FlatConfigArray } from "../types.ts"

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
        "json/no-duplicate-keys": "error",
      },
    },
  ]
}
