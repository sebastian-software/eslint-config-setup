import { renderTemplate } from "./render"

const OXLINT_CONFIG_TEMPLATE = `import { defineConfig } from "oxlint"
import { getOxlintConfig } from "eslint-config-setup"

export default defineConfig(getOxlintConfig({{configOptions}}))
`

export function renderOxlintConfigTemplate(configOptions: string): string {
  return renderTemplate(OXLINT_CONFIG_TEMPLATE, { configOptions })
}
