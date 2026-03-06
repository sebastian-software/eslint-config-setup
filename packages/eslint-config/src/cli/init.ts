import { chmodSync, mkdirSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

import type { InitOptions, PackageManager, ProjectPackageJson } from "./shared"

import {
  detectPackageManager,
  formatConfigOptions,
  readPackageJson,
  readTextIfExists,
  writeJsonFile,
  writeTextFile,
} from "./shared"

export interface InitOutcome {
  files: string[]
  installedDependencies: string[]
  packageManager: PackageManager
  scripts: string[]
}

export function runInit(opts: InitOptions): InitOutcome {
  const packageJson = readPackageJson(opts.cwd)
  if (!packageJson) {
    throw new Error(`No package.json found in ${opts.cwd}`)
  }

  const packageManager = detectPackageManager(opts.cwd, packageJson)
  const files: string[] = []
  const installedDependencies = getDependenciesToInstall(opts)
  const scripts = getScripts(opts)

  writeProjectFiles(opts, packageJson, scripts, files)

  if (opts.install) {
    installDependencies(opts.cwd, packageManager, installedDependencies)
  }

  return {
    files,
    installedDependencies,
    packageManager,
    scripts: Object.keys(scripts),
  }
}

function writeProjectFiles(
  opts: InitOptions,
  packageJson: ProjectPackageJson,
  scripts: Record<string, string>,
  files: string[],
): void {
  const nextPackageJson = {
    ...packageJson,
    scripts: {
      ...packageJson.scripts,
      ...scripts,
    },
  }

  const eslintConfigPath = path.join(opts.cwd, "eslint.config.ts")
  const packageJsonPath = path.join(opts.cwd, "package.json")

  if (opts.dryRun) {
    files.push(packageJsonPath, eslintConfigPath)
  } else {
    writeJsonFile(packageJsonPath, nextPackageJson)
    writeTextFile(eslintConfigPath, renderEslintConfig(opts))
    files.push(packageJsonPath, eslintConfigPath)
  }

  if (opts.oxlint) {
    const oxlintConfigPath = path.join(opts.cwd, "oxlint.config.ts")
    if (opts.dryRun) {
      files.push(oxlintConfigPath)
    } else {
      writeTextFile(oxlintConfigPath, renderOxlintConfig(opts))
      files.push(oxlintConfigPath)
    }
  }

  if (opts.agents) {
    const agentsPath = path.join(opts.cwd, "AGENTS.md")
    if (opts.dryRun) {
      files.push(agentsPath)
    } else {
      writeTextFile(agentsPath, renderAgentsGuide(opts))
      files.push(agentsPath)
    }
  }

  if (opts.vscode) {
    const vscodeDir = path.join(opts.cwd, ".vscode")
    const vscodePath = path.join(vscodeDir, "settings.json")
    const settings = renderVscodeSettings(opts, readTextIfExists(vscodePath))

    if (opts.dryRun) {
      files.push(vscodePath)
    } else {
      mkdirSync(vscodeDir, { recursive: true })
      writeTextFile(vscodePath, settings)
      files.push(vscodePath)
    }
  }

  if (opts.hooks) {
    const hooksDir = path.join(opts.cwd, ".githooks")
    const hookPath = path.join(hooksDir, "pre-commit")
    if (opts.dryRun) {
      files.push(hookPath)
    } else {
      mkdirSync(hooksDir, { recursive: true })
      writeTextFile(hookPath, renderPreCommitHook(opts))
      chmodSync(hookPath, 0o755)
      files.push(hookPath)
    }
  }
}

function getDependenciesToInstall(opts: InitOptions): string[] {
  const dependencies = ["eslint", "eslint-config-setup", "typescript"]

  if (opts.oxlint) {
    dependencies.push("oxlint")
  }

  if (opts.formatter === "oxfmt") {
    dependencies.push("oxfmt")
  }

  return dependencies
}

function getScripts(opts: InitOptions): Record<string, string> {
  const lint = opts.oxlint ? "oxlint . && eslint ." : "eslint ."
  const lintFix = opts.oxlint ? "oxlint . --fix && eslint . --fix" : "eslint . --fix"

  const scripts: Record<string, string> = {
    check: lint,
    lint,
    "lint:fix": lintFix,
  }

  if (opts.formatter === "oxfmt") {
    scripts.format = "oxfmt --write ."
    scripts["format:check"] = "oxfmt --check ."
    scripts.check = `oxfmt --check . && ${lint}`
    scripts.fix = `oxfmt --write . && ${lintFix}`
  } else {
    scripts.fix = lintFix
  }

  if (opts.hooks) {
    scripts["hooks:install"] = "git config core.hooksPath .githooks"
  }

  return scripts
}

function installDependencies(
  cwd: string,
  packageManager: PackageManager,
  dependencies: string[],
): void {
  const command = getInstallCommand(packageManager, dependencies)
  const result = spawnSync(command.bin, command.args, {
    cwd,
    stdio: "inherit",
  })

  if (result.status !== 0) {
    throw new Error(`Dependency installation failed with exit code ${result.status ?? 1}`)
  }
}

function getInstallCommand(
  packageManager: PackageManager,
  dependencies: string[],
): { args: string[]; bin: string } {
  switch (packageManager) {
    case "bun":
      return { bin: "bun", args: ["add", "-d", ...dependencies] }
    case "pnpm":
      return { bin: "pnpm", args: ["add", "-D", ...dependencies] }
    case "yarn":
      return { bin: "yarn", args: ["add", "-D", ...dependencies] }
    default:
      return { bin: "npm", args: ["install", "-D", ...dependencies] }
  }
}

function renderAgentsGuide(opts: InitOptions): string {
  const commands = [
    "- Run `npm run lint` before handing work back.",
    opts.formatter === "oxfmt"
      ? "- Run `npm run format` when touching code style-sensitive files."
      : "- Do not add formatting-only churn unless explicitly requested.",
    opts.oxlint
      ? "- Keep `oxlint` and `eslint` flows aligned; do not remove one side of the split-lint setup."
      : "- Keep the ESLint config as the source of truth for code-quality rules.",
    opts.ai
      ? "- Prefer explicit types, stable naming, small functions, and no magic values."
      : "- Preserve the existing lint standard instead of inventing local exceptions.",
  ]

  return `# AGENTS.md

## Working Agreement

This project uses \`eslint-config-setup\` as a deterministic, pre-generated lint baseline.

${commands.join("\n")}
`
}

function renderEslintConfig(opts: InitOptions): string {
  const configOptions = formatConfigOptions({
    ai: opts.ai,
    node: opts.node,
    oxlint: opts.oxlint,
    react: opts.react,
  })

  return `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig(${configOptions})
`
}

function renderOxlintConfig(opts: InitOptions): string {
  const configOptions = formatConfigOptions({
    ai: opts.ai,
    node: opts.node,
    react: opts.react,
  })

  return `import { defineConfig } from "oxlint"
import { getOxlintConfig } from "eslint-config-setup"

export default defineConfig(getOxlintConfig(${configOptions}))
`
}

function renderPreCommitHook(opts: InitOptions): string {
  const commands = []

  if (opts.formatter === "oxfmt") {
    commands.push("npm run format:check")
  }

  commands.push("npm run lint")

  return `#!/bin/sh
set -e

${commands.join("\n")}
`
}

function renderVscodeSettings(
  opts: InitOptions,
  existingContent: string | null,
): string {
  const existing = existingContent
    ? JSON.parse(existingContent) as Record<string, unknown>
    : {}

  const settings: Record<string, unknown> = {
    ...existing,
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

  return `${JSON.stringify(settings, null, 2)}\n`
}
