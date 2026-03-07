import { renderTemplate } from "./render"

const ESLINT_CONFIG_TEMPLATE = `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({{configOptions}})
`

export function renderEslintConfigTemplate(configOptions: string): string {
  return renderTemplate(ESLINT_CONFIG_TEMPLATE, { configOptions })
}
