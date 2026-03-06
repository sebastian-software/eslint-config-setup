import { mkdtempSync, writeFileSync } from "node:fs"
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

export default await getEslintConfig({ oxlint: true })
`,
    )

    const result = runDoctor(dir)

    expect(result.exitCode).toBe(1)
    expect(result.checks.some((check) => check.message.includes("Missing eslint-config-setup dependency"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("Missing TypeScript dependency"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("oxlint is not installed"))).toBe(true)
    expect(result.checks.some((check) => check.message.includes("no oxlint config file"))).toBe(true)
  })
})
