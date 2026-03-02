import { composeConfig } from "./packages/eslint-config/src/build/compose.ts"

const config = composeConfig({ node: true })

// Ignore directories and file types not relevant for self-linting
config.unshift({
  ignores: [
    "refs/",
    "docs/",
    "packages/eslint-config/dist/",
    "packages/eslint-config/coverage/",
    ".claude/",
    "**/*.md",
    "**/*.mdx",
    "**/*.json",
  ],
})

export default config
