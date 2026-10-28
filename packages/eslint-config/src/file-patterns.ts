export const TYPESCRIPT_SOURCE_FILES = [
  "**/*.ts",
  "**/*.tsx",
  "**/*.mts",
  "**/*.cts",
] as const

export const JAVASCRIPT_SOURCE_FILES = ["**/*.{js,mjs,cjs}"] as const

export const MARKDOWN_DOCUMENT_FILES = ["**/*.{md,mdx}"] as const
export const MARKDOWN_CODE_BLOCK_FILES = ["**/*.{md,mdx}/**"] as const
