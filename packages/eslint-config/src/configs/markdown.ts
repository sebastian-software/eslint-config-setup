import * as mdxPlugin from "eslint-plugin-mdx"

import type { FlatConfigArray } from "../types"

/**
 * Markdown & MDX config — lints code blocks inside Markdown and MDX files
 * using eslint-plugin-mdx. Code examples in docs get the same ESLint rules
 * as your source code. Covers both `.md` and `.mdx` files.
 *
 * Markdown structure linting (headings, links, etc.) is intentionally left
 * to dedicated tools like markdownlint.
 *
 * @see https://github.com/mdx-js/eslint-mdx
 * @see https://github.com/DavidAnson/markdownlint-cli2 (recommended for Markdown structure linting)
 */
export function markdownConfig(): FlatConfigArray {
  const codeBlockLanguageOptions =
    (mdxPlugin.flatCodeBlocks.languageOptions as Record<string, unknown> | undefined) ?? {}
  const codeBlockParserOptions =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Typing parserOptions from mdx plugin
    (codeBlockLanguageOptions.parserOptions as Record<string, unknown> | undefined) ?? {}

  return [
    // ── MDX / Markdown parsing ─────────────────────────────────────
    {
      ...mdxPlugin.flat,
      processor: mdxPlugin.createRemarkProcessor({
        lintCodeBlocks: true,
        languageMapper: {},
      }),
    },

    // ── Code block linting ─────────────────────────────────────────
    // Applies ESLint rules to fenced code blocks extracted from .md/.mdx.
    // Relaxes rules that don't apply to incomplete code snippets.
    {
      ...mdxPlugin.flatCodeBlocks,
      languageOptions: {
        ...codeBlockLanguageOptions,
        parserOptions: {
          ...codeBlockParserOptions,
          projectService: false,
        },
      },
      rules: {
        ...mdxPlugin.flatCodeBlocks.rules,
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
