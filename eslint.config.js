import { getEslintConfig } from "eslint-config-setup"

const config = await getEslintConfig({ node: true })

// Root self-lint focuses on the package workspace; docs have their own React-aware config.
config.unshift({
  ignores: [
    "refs/",
    "docs/",
    "packages/*/dist/",
    "packages/*/coverage/",
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
