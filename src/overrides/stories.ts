import type { FlatConfigArray } from "../types.ts"

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
        "storybook/await-interactions": "error",
        "storybook/default-exports": "error",
        "storybook/hierarchy-separator": "error",
        "storybook/no-redundant-story-name": "error",
        "storybook/no-stories-of": "error",
        "storybook/no-title-property-in-meta": "warn",
        "storybook/prefer-pascal-case": "error",
        "storybook/story-exports": "error",
        "storybook/use-storybook-expect": "error",
        "storybook/use-storybook-testing-library": "error",

        // Relaxed rules for stories
        "import-x/no-default-export": "off",
        "max-lines": "off",
        "max-lines-per-function": "off",
      },
    },
  ]
}
