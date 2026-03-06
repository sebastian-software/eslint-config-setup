import { chmodSync, mkdirSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

import type { InitOptions, PackageManager, ProjectPackageJson } from "./shared"
import { renderAgentsTemplate } from "./templates/agents"
import { renderEslintConfigTemplate } from "./templates/eslint-config"
import { renderOxlintConfigTemplate } from "./templates/oxlint-config"
import { renderPreCommitTemplate } from "./templates/pre-commit"
import { createVscodeSettingsTemplate } from "./templates/vscode-settings"

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
  installCommand: string
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
    installCommand: formatInstallCommand(packageManager, installedDependencies),
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
  const packageManager = detectPackageManager(opts.cwd, packageJson)
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
      writeTextFile(agentsPath, renderAgentsGuide(opts, packageManager))
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
      writeTextFile(hookPath, renderPreCommitHook(opts, packageManager))
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

function renderAgentsGuide(
  opts: InitOptions,
  packageManager: PackageManager,
): string {
  const run = getRunCommand(packageManager)
  const commands = [
    `- Before handoff, run \`${run} check\`.`,
    "- If the quality gate fails, fix the setup or code instead of bypassing the tooling.",
    opts.oxlint
      ? "- Keep OxLint and ESLint in the same verification path; do not drop one side of the split-lint setup."
      : "- Keep ESLint as the source of truth for code-quality verification.",
    opts.formatter === "oxfmt"
      ? `- Use \`${run} format\` when you intentionally apply formatting changes.`
      : "- Do not add formatting-only churn unless explicitly requested.",
    "- Keep `eslint.config.ts`, optional `oxlint.config.ts`, and package scripts aligned when changing the setup.",
  ]

  return renderAgentsTemplate(commands)
}

function renderEslintConfig(opts: InitOptions): string {
  const configOptions = formatConfigOptions({
    ai: opts.ai,
    node: opts.node,
    oxlint: opts.oxlint,
    react: opts.react,
  })

  return renderEslintConfigTemplate(configOptions)
}

function renderOxlintConfig(opts: InitOptions): string {
  const configOptions = formatConfigOptions({
    ai: opts.ai,
    node: opts.node,
    react: opts.react,
  })

  return renderOxlintConfigTemplate(configOptions)
}

function renderPreCommitHook(
  opts: InitOptions,
  packageManager: PackageManager,
): string {
  const run = getRunCommand(packageManager)
  const commands = []

  if (opts.formatter === "oxfmt") {
    commands.push(`${run} format:check`)
  }

  commands.push(`${run} lint`)

  return renderPreCommitTemplate(commands)
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
    ...createVscodeSettingsTemplate(opts),
  }

  return `${JSON.stringify(settings, null, 2)}\n`
}

function formatInstallCommand(
  packageManager: PackageManager,
  dependencies: string[],
): string {
  const command = getInstallCommand(packageManager, dependencies)
  return [command.bin, ...command.args].join(" ")
}

function getRunCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case "bun":
      return "bun run"
    case "pnpm":
      return "pnpm run"
    case "yarn":
      return "yarn"
    default:
      return "npm run"
  }
}
