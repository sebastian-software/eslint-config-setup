import type { InitOptions } from "../shared"

export function createVscodeSettingsTemplate(
  opts: InitOptions,
): Record<string, unknown> {
  return {
    "editor.formatOnSave": opts.formatter === "oxfmt",
    "eslint.useFlatConfig": true,
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "json",
      "jsonc",
      "markdown",
      "typescript",
      "typescriptreact",
    ],
  }
}
