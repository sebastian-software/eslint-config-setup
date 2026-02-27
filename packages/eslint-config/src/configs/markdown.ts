import markdownPlugin from "@eslint/markdown"

import type { FlatConfigArray } from "../types"

/**
 * Markdown config — structural linting for Markdown files using the official
 * @eslint/markdown plugin. Validates headings, links, and code blocks.
 * Formatting is left to Prettier.
 *
 * @see https://github.com/eslint/markdown#rules
 */
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
        // OFF: Allow HTML in Markdown — many use cases (badges, details, etc.)
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-html.md
        "markdown/no-html": "off",

        // Require language on fenced code blocks — enables syntax highlighting
        // https://github.com/eslint/markdown/blob/main/docs/rules/fenced-code-language.md
        "markdown/fenced-code-language": "error",

        // Headings must increment by one level (h1 → h2, not h1 → h3)
        // https://github.com/eslint/markdown/blob/main/docs/rules/heading-increment.md
        "markdown/heading-increment": "error",

        // Warn on duplicate headings — confusing navigation, but sometimes needed
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-headings.md
        "markdown/no-duplicate-headings": "warn",

        // Prevent empty links [text]() — always a mistake
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-links.md
        "markdown/no-empty-links": "error",
      },
    },
  ]
}
