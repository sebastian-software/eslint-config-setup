import type { FlatConfigArray } from "../types.ts"

/**
 * Storybook overrides — Storybook best-practice rules for story files.
 *
 * File pattern: *.stories.{ts,tsx}
 *
 * @see https://github.com/storybookjs/eslint-plugin-storybook#supported-rules
 */
export function storiesOverride(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/stories",
      files: ["**/*.stories.{ts,tsx}"],
      plugins: {
        get storybook() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-storybook")
        },
      },
      rules: {
        // ── Storybook rules ───────────────────────────────────────────

        // Await play function interactions — prevents race conditions
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/await-interactions.md
        "storybook/await-interactions": "error",

        // Stories must have a default export (meta) — Storybook requirement
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/default-exports.md
        "storybook/default-exports": "error",

        // Use / for hierarchy separators, not | or . — Storybook 7+ convention
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/hierarchy-separator.md
        "storybook/hierarchy-separator": "error",

        // No redundant story names that match export name — DRY
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/no-redundant-story-name.md
        "storybook/no-redundant-story-name": "error",

        // No deprecated storiesOf() API — use CSF (Component Story Format)
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/no-stories-of.md
        "storybook/no-stories-of": "error",

        // Warn if title is in meta — auto-title is preferred in CSF 3
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/no-title-property-in-meta.md
        "storybook/no-title-property-in-meta": "warn",

        // Story exports should be PascalCase — component naming convention
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/prefer-pascal-case.md
        "storybook/prefer-pascal-case": "error",

        // File must export at least one story — prevents empty story files
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/story-exports.md
        "storybook/story-exports": "error",

        // Use Storybook's expect() instead of Jest/Vitest in play functions
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/use-storybook-expect.md
        "storybook/use-storybook-expect": "error",

        // Use Storybook's Testing Library, not direct import
        // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/use-storybook-testing-library.md
        "storybook/use-storybook-testing-library": "error",

        // ── Relaxed rules for stories ─────────────────────────────────

        // Stories require default exports (meta object)
        "import/no-default-export": "off",

        // Stories can be long (many variants of a component)
        "max-lines": "off",
        "max-lines-per-function": "off",
      },
    },
  ]
}
