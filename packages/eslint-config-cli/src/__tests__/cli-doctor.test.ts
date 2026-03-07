import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"

import { describe, expect, it } from "vitest"

import { runDoctor } from "../cli/doctor"

function createProjectDir(): string {
  return mkdtempSync(path.join(tmpdir(), "eslint-config-setup-doctor-"))
}

describe("runDoctor", () => {
  it("passes a healthy eslint + oxlint + oxfmt setup", () => {
    const dir = createProjectDir()

    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        devDependencies: {
          eslint: "^10.0.0",
          "eslint-config-setup": "^0.3.3",
          oxfmt: "^0.1.0",
          oxlint: "^1.0.0",
          typescript: "^5.0.0",
        },
        scripts: {
          check: "oxfmt --check . && oxlint . && eslint .",
          format: "oxfmt --write .",
          "hooks:install": "git config core.hooksPath .githooks",
          lint: "oxlint . && eslint .",
        },
      }, null, 2),
    )

    writeFileSync(
      path.join(dir, "eslint.config.ts"),
      `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true, oxlint: true })
`,
    )
    writeFileSync(
      path.join(dir, "oxlint.config.ts"),
      `import { defineConfig } from "oxlint"
import { getOxlintConfig } from "eslint-config-setup"

export default defineConfig(getOxlintConfig({ react: true }))
`,
    )
    writeFileSync(
      path.join(dir, "AGENTS.md"),
      `# AGENTS.md

## Quality Gate

- Before handoff, run \`npm run check\`.
`,
    )
    mkdirSync(path.join(dir, ".vscode"), { recursive: true })
    writeFileSync(
      path.join(dir, ".vscode/settings.json"),
      JSON.stringify({ "editor.formatOnSave": true }, null, 2),
    )
    mkdirSync(path.join(dir, ".githooks"), { recursive: true })
    writeFileSync(
      path.join(dir, ".githooks/pre-commit"),
      "npm run format:check\nnpm run lint\n",
    )

    const result = runDoctor(dir)

    expect(result.exitCode).toBe(0)
    expect(result.checks.some((check) => check.level === "fail")).toBe(false)
  })

  it("fails broken setups with actionable checks", () => {
    const dir = createProjectDir()

    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        devDependencies: {
          eslint: "^10.0.0",
        },
      }, null, 2),
    )
    writeFileSync(
      path.join(dir, "eslint.config.ts"),
      `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ ai: true, oxlint: true })
`,
    )

    const result = runDoctor(dir)

    expect(result.exitCode).toBe(1)
    expect(result.checks.some((check) => check.message.includes("Missing eslint-config-setup dependency"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("Missing TypeScript dependency"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("oxlint is not installed"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("no oxlint config file"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("AGENTS.md is missing"))).toBe(true)
    expect(result.checks.some((check) => check.fix?.includes("npx eslint-config-setup init --oxlint --dry-run"))).toBe(true)
  })

  it("warns about inconsistent companion wiring", () => {
    const dir = createProjectDir()

    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        devDependencies: {
          eslint: "^10.0.0",
          "eslint-config-setup": "^0.3.3",
          typescript: "^5.0.0",
        },
        scripts: {
          check: "eslint .",
          format: "oxfmt --write .",
          "hooks:install": "git config core.hooksPath .githooks",
          lint: "eslint .",
        },
      }, null, 2),
    )
    writeFileSync(
      path.join(dir, "eslint.config.ts"),
      `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true, ai: true })
`,
    )
    writeFileSync(
      path.join(dir, "AGENTS.md"),
      `# AGENTS.md

No commands here.
`,
    )

    const result = runDoctor(dir)

    expect(result.checks.some((check) => check.message.includes("check script does not verify formatting"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("explicit verification command"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes(".githooks/pre-commit is missing"))).toBe(true)
  })

  it("warns when init-managed scripts and companions drift from generated defaults", () => {
    const dir = createProjectDir()

    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        devDependencies: {
          eslint: "^10.0.0",
          "eslint-config-setup": "^0.3.3",
          oxfmt: "^0.1.0",
          typescript: "^5.0.0",
        },
        packageManager: "pnpm@10.0.0",
        scripts: {
          check: "eslint .",
          format: "oxfmt --write .",
          lint: "eslint .",
        },
      }, null, 2),
    )
    writeFileSync(
      path.join(dir, "eslint.config.ts"),
      `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true, ai: true })
`,
    )
    writeFileSync(
      path.join(dir, "AGENTS.md"),
      `# AGENTS.md

- Ship it.
`,
    )
    mkdirSync(path.join(dir, ".vscode"), { recursive: true })
    writeFileSync(
      path.join(dir, ".vscode/settings.json"),
      JSON.stringify({
        "editor.formatOnSave": false,
        "eslint.useFlatConfig": false,
      }, null, 2),
    )

    const result = runDoctor(dir)

    expect(result.checks.some((check) => check.message.includes("Init-managed package scripts drift"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("Init-managed companion files drift"))).toBe(true)
    expect(result.checks.some((check) => check.fix?.includes("pnpm exec eslint-config-setup init --react --ai --formatter oxfmt --vscode --agents --dry-run"))).toBe(true)
  })
})
