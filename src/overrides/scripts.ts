import type { FlatConfigArray } from "../types.ts"

export function scriptsOverride(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/scripts",
      files: ["**/scripts/**/*.{ts,mts,js,mjs}"],
      rules: {
        "no-console": "off",
        "n/no-process-exit": "off",
        "max-lines": "off",
        "max-lines-per-function": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "unicorn/no-process-exit": "off",
      },
    },
  ]
}
