import { getEslintConfig } from "eslint-config-setup"

const config = await getEslintConfig({ react: true })

config.unshift({
  ignores: [
    "docs/.react-router/",
    "docs/build/",
    "**/*.md/*",
    "**/*.mdx/*",
    "**/*.json",
    "docs/app/routes.ts",
    "docs/app/routes/api-reference/**/*.md",
  ],
})

config.push(
  {
    files: ["docs/app/**/*.{ts,tsx,mdx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["docs/app/components/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
    },
  },
  {
    files: ["docs/app/components/CTAFooter.tsx"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
  {
    files: ["docs/app/entry.server.tsx"],
    rules: {
      "max-params": "off",
    },
  }
)

export default config
