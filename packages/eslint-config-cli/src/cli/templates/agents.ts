import { renderTemplate } from "./render"

const AGENTS_TEMPLATE = `# AGENTS.md

## Quality Gate

This project uses \`eslint-config-setup\` as its verification baseline.

{{commands}}
`

export function renderAgentsTemplate(commands: string[]): string {
  return renderTemplate(AGENTS_TEMPLATE, {
    commands: commands.join("\n"),
  })
}
