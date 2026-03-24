import { getEslintConfig } from "eslint-config-setup"

const config = await getEslintConfig({ node: true })

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
    // Config files outside tsconfig's src/ scope
    "eslint.config.js",
    "packages/eslint-config/tsup.config.ts",
    "packages/eslint-config/vitest.config.ts",
  ],
})

export default config
