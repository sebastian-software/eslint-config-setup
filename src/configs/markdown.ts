import markdownPlugin from "@eslint/markdown"

import type { FlatConfigArray } from "../types.ts"

export function markdownConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/markdown",
      files: ["**/*.md"],
      plugins: {
        markdown: markdownPlugin,
      },
      language: "markdown/commonmark",
      rules: {
        "markdown/no-html": "off",
        "markdown/fenced-code-language": "error",
        "markdown/heading-increment": "error",
        "markdown/no-duplicate-headings": "warn",
        "markdown/no-empty-links": "error",
      },
    },
  ]
}
