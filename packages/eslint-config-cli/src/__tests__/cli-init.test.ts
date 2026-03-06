import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"

import { describe, expect, it } from "vitest"

import { runInit } from "../cli/init"

function createProjectDir(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "eslint-config-setup-init-"))
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "fixture", private: true }, null, 2),
  )
  return dir
}

describe("runInit", () => {
  it("writes eslint config and package scripts", () => {
    const dir = createProjectDir()

    const outcome = runInit({
      cwd: dir,
      react: true,
    })

    const packageJson = JSON.parse(
      readFileSync(path.join(dir, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> }
    const eslintConfig = readFileSync(path.join(dir, "eslint.config.ts"), "utf8")

    expect(packageJson.scripts.lint).toBe("eslint .")
    expect(packageJson.scripts["lint:fix"]).toBe("eslint . --fix")
    expect(eslintConfig).toContain("react: true")
    expect(outcome.files).toContain(path.join(dir, "eslint.config.ts"))
  })

  it("adds oxlint, agent, vscode, formatter, and hook companions", () => {
    const dir = createProjectDir()
    mkdirSync(path.join(dir, ".vscode"), { recursive: true })
    writeFileSync(path.join(dir, ".vscode/settings.json"), "{\n  \"files.trimTrailingWhitespace\": true\n}\n")

    runInit({
      agents: true,
      ai: true,
      cwd: dir,
      formatter: "oxfmt",
      hooks: true,
      oxlint: true,
      react: true,
      vscode: true,
    })

    const packageJson = JSON.parse(
      readFileSync(path.join(dir, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> }
    const oxlintConfig = readFileSync(path.join(dir, "oxlint.config.ts"), "utf8")
    const agents = readFileSync(path.join(dir, "AGENTS.md"), "utf8")
    const vscode = readFileSync(path.join(dir, ".vscode/settings.json"), "utf8")
    const hook = readFileSync(path.join(dir, ".githooks/pre-commit"), "utf8")

    expect(packageJson.scripts.check).toContain("oxfmt --check .")
    expect(packageJson.scripts.check).toContain("oxlint . && eslint .")
    expect(packageJson.scripts["hooks:install"]).toBe("git config core.hooksPath .githooks")
    expect(oxlintConfig).toContain("getOxlintConfig")
    expect(agents).toContain("Before handoff, run `npm run check`.")
    expect(agents).toContain("Keep OxLint and ESLint in the same verification path")
    expect(vscode).toContain("\"eslint.useFlatConfig\": true")
    expect(vscode).toContain("\"files.trimTrailingWhitespace\": true")
    expect(hook).toContain("npm run format:check")
    expect(hook).toContain("npm run lint")
  })

  it("renders package-manager-specific commands in generated companions", () => {
    const dir = createProjectDir()
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "fixture", packageManager: "pnpm@10.0.0", private: true }, null, 2),
    )

    runInit({
      agents: true,
      cwd: dir,
      formatter: "oxfmt",
      hooks: true,
      react: true,
    })

    const agents = readFileSync(path.join(dir, "AGENTS.md"), "utf8")
    const hook = readFileSync(path.join(dir, ".githooks/pre-commit"), "utf8")

    expect(agents).toContain("pnpm run check")
    expect(agents).toContain("pnpm run format")
    expect(hook).toContain("pnpm run format:check")
    expect(hook).toContain("pnpm run lint")
  })

  it("supports dry-run without writing files", () => {
    const dir = createProjectDir()

    const outcome = runInit({
      agents: true,
      cwd: dir,
      dryRun: true,
      oxlint: true,
      react: true,
      vscode: true,
    })

    expect(outcome.files).toContain(path.join(dir, "eslint.config.ts"))
    expect(outcome.files).toContain(path.join(dir, "oxlint.config.ts"))
    expect(outcome.files).toContain(path.join(dir, "AGENTS.md"))
  })
})
