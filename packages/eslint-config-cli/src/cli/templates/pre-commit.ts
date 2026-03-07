import { renderTemplate } from "./render"

const PRE_COMMIT_TEMPLATE = `#!/bin/sh
set -e

{{commands}}
`

export function renderPreCommitTemplate(commands: string[]): string {
  return renderTemplate(PRE_COMMIT_TEMPLATE, {
    commands: commands.join("\n"),
  })
}
