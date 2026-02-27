import type { FlatConfigArray } from "../types.ts"

/**
 * Script file overrides — relaxed rules for build/dev scripts.
 * Scripts are CLI tools that legitimately use console.log and process.exit.
 *
 * File pattern: scripts dir (*.ts, *.mts, *.js, *.mjs)
 */
export function scriptsOverride(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/scripts",
      files: ["**/scripts/**/*.{ts,mts,js,mjs}"],
      rules: {
        // Scripts use console for user-facing output
        "no-console": "off",

        // Scripts use process.exit for clean termination
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-process-exit.md
        "node/no-process-exit": "off",

        // Scripts can be long (build pipelines, code generators)
        "max-lines": "off",
        "max-lines-per-function": "off",

        // Scripts are often procedural without explicit return types
        "@typescript-eslint/explicit-function-return-type": "off",

        // Scripts legitimately call process.exit()
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-process-exit.md
        "unicorn/no-process-exit": "off",
      },
    },
  ]
}
