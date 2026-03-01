import markdownPlugin from "@eslint/markdown"

import type { FlatConfigArray } from "../types"

/**
 * Markdown config — lints code blocks inside Markdown files using the official
 * @eslint/markdown processor. Code examples in docs get the same ESLint rules
 * as your source code. A small set of structural Markdown rules catches
 * obvious errors; for comprehensive Markdown style linting use markdownlint.
 *
 * @see https://github.com/eslint/markdown#processors
 * @see https://github.com/eslint/markdown#rules
 * @see https://github.com/DavidAnson/markdownlint-cli2 (recommended for full Markdown linting)
 */
export function markdownConfig(): FlatConfigArray {
  return [
    // ── Structural Markdown rules ─────────────────────────────────
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

        // Prevent empty links [text]() — always a mistake
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-links.md
        "markdown/no-empty-links": "error",
      },
    },

    // ── Code block linting ────────────────────────────────────────
    // Extracts fenced code blocks from .md files and runs ESLint rules on them.
    // Your JS/TS code examples get the same checks as your source code.
    {
      name: "@effective/eslint/markdown-code-blocks",
      files: ["**/*.md"],
      plugins: {
        markdown: markdownPlugin,
      },
      processor: "markdown/markdown",
    },

    // Disable rules that don't apply to code snippets (incomplete by nature)
    {
      name: "@effective/eslint/markdown-code-blocks-relaxed",
      files: ["**/*.md/**"],
      rules: {
        // Snippets don't need trailing newlines
        "eol-last": "off",
        // Variables may be defined elsewhere
        "no-undef": "off",
        // Snippets often show standalone expressions
        "no-unused-expressions": "off",
        // Variables are often declared for demonstration
        "no-unused-vars": "off",
        // Padding is irrelevant in snippets
        "padded-blocks": "off",
        // Strict mode is irrelevant in snippets
        strict: "off",
        // BOM is irrelevant in snippets
        "unicode-bom": "off",
      },
    },
  ]
}
