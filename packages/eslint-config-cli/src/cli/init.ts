import { chmodSync, mkdirSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

import type { HookStrategy, InitOptions, PackageManager, ProjectPackageJson } from "./shared"
import { renderAgentsTemplate } from "./templates/agents"
import { renderEslintConfigTemplate } from "./templates/eslint-config"
import { renderOxlintConfigTemplate } from "./templates/oxlint-config"
import { renderPreCommitTemplate } from "./templates/pre-commit"
import { createVscodeSettingsTemplate } from "./templates/vscode-settings"

import {
  detectPackageManager,
  findEslintConfigFile,
  findOxlintConfigFile,
  formatConfigOptions,
  formatInstallCommand,
  getInstallCommand,
  getRunCommand,
  readPackageJson,
  readTextIfExists,
  writeTextFile,
} from "./shared"

export interface InitOutcome {
  files: string[]
  fileChanges: InitFileChange[]
  installCommand: string
  installNeeded: boolean
  dependencyChanges: InitDependencyChange[]
  installedDependencies: string[]
  packageManager: PackageManager
  scripts: string[]
  scriptChanges: InitScriptChange[]
}

export interface InitConflict {
  canForce: boolean
  message: string
}

export interface InitPreview extends InitOutcome {
  conflicts: InitConflict[]
}

export interface InitDependencyChange {
  action: "install" | "reuse"
  name: string
}

export interface InitFileChange {
  action: "create" | "merge" | "update"
  filepath: string
}

export interface InitScriptChange {
  action: "add" | "update"
  name: string
}

interface PlannedFile {
  action: "create" | "keep" | "merge" | "update"
  content: string
  executable?: boolean
  filepath: string
}

export class InitConflictError extends Error {
  conflicts: InitConflict[]

  constructor(conflicts: InitConflict[]) {
    super(formatConflictError(conflicts))
    this.name = "InitConflictError"
    this.conflicts = conflicts
  }
}

export function runInit(opts: InitOptions): InitOutcome {
  const plan = previewInit(opts)

  if (plan.conflicts.length > 0 && (!opts.force || plan.conflicts.some((conflict) => !conflict.canForce))) {
    throw new InitConflictError(plan.conflicts)
  }

  if (!opts.dryRun) {
    writeProjectFiles(plan)
  }

  if (plan.installNeeded && opts.install) {
    installDependencies(opts.cwd, plan.packageManager, plan.installedDependencies)
  }

  return {
    files: plan.files,
    fileChanges: plan.fileChanges,
    dependencyChanges: plan.dependencyChanges,
    installCommand: plan.installCommand,
    installNeeded: plan.installNeeded,
    installedDependencies: plan.installedDependencies,
    packageManager: plan.packageManager,
    scripts: plan.scripts,
    scriptChanges: plan.scriptChanges,
  }
}

export function previewInit(opts: InitOptions): InitPreview & {
  filesToWrite: PlannedFile[]
  packageManager: PackageManager
} {
  const packageJson = readPackageJson(opts.cwd)
  if (!packageJson) {
    throw new Error(`No package.json found in ${opts.cwd}`)
  }

  const packageManager = detectPackageManager(opts.cwd, packageJson)
  const dependencyChanges = getDependencyChanges(packageJson, opts)
  const installedDependencies = dependencyChanges
    .filter((dependency) => dependency.action === "install")
    .map((dependency) => dependency.name)
  const scripts = getScripts(opts)
  const filesToWrite = getPlannedFiles(opts, packageJson, scripts, packageManager)
  const conflicts = getConflicts(opts, packageJson, scripts, filesToWrite)
  const fileChanges: InitFileChange[] = filesToWrite.flatMap((file) => {
    if (file.action === "keep") {
      return []
    }

    return [{
      action: file.action,
      filepath: file.filepath,
    }]
  })
  const scriptChanges = getScriptChanges(packageJson, scripts)

  return {
    conflicts,
    dependencyChanges,
    fileChanges,
    files: fileChanges.map((file) => file.filepath),
    filesToWrite,
    installCommand: installedDependencies.length > 0
      ? formatInstallCommand(packageManager, installedDependencies)
      : "",
    installNeeded: installedDependencies.length > 0,
    installedDependencies,
    packageManager,
    scripts: Object.keys(scripts),
    scriptChanges,
  }
}

function writeProjectFiles(
  plan: InitPreview & {
    filesToWrite: PlannedFile[]
  },
): void {
  for (const file of plan.filesToWrite) {
    if (file.action === "keep") {
      continue
    }

    mkdirSync(path.dirname(file.filepath), { recursive: true })
    writeTextFile(file.filepath, file.content)
    if (file.executable) {
      chmodSync(file.filepath, 0o755)
    }
  }
}

function getPlannedFiles(
  opts: InitOptions,
  packageJson: ProjectPackageJson,
  scripts: Record<string, string>,
  packageManager: PackageManager,
): PlannedFile[] {
  const hookStrategy = resolveHookStrategy(opts)
  const nextPackageJson = {
    ...packageJson,
    scripts: {
      ...packageJson.scripts,
      ...scripts,
    },
  }

  const eslintConfigPath = path.join(opts.cwd, "eslint.config.ts")
  const packageJsonPath = path.join(opts.cwd, "package.json")
  const filesToWrite: PlannedFile[] = [
    {
      action: getFileAction(packageJsonPath, `${JSON.stringify(nextPackageJson, null, 2)}\n`),
      content: `${JSON.stringify(nextPackageJson, null, 2)}\n`,
      filepath: packageJsonPath,
    },
    {
      action: getFileAction(eslintConfigPath, renderEslintConfig(opts)),
      content: renderEslintConfig(opts),
      filepath: eslintConfigPath,
    },
  ]

  if (opts.oxlint) {
    const oxlintConfigPath = path.join(opts.cwd, "oxlint.config.ts")
    filesToWrite.push({
      action: getFileAction(oxlintConfigPath, renderOxlintConfig(opts)),
      content: renderOxlintConfig(opts),
      filepath: oxlintConfigPath,
    })
  }

  if (opts.agents) {
    filesToWrite.push({
      action: getFileAction(
        path.join(opts.cwd, "AGENTS.md"),
        renderAgentsGuide(opts, packageManager),
      ),
      content: renderAgentsGuide(opts, packageManager),
      filepath: path.join(opts.cwd, "AGENTS.md"),
    })
  }

  if (opts.vscode) {
    const vscodePath = path.join(opts.cwd, ".vscode/settings.json")
    const renderedSettings = renderVscodeSettings(opts, readTextIfExists(vscodePath))
    filesToWrite.push({
      action: getFileAction(vscodePath, renderedSettings, "merge"),
      content: renderedSettings,
      filepath: vscodePath,
    })
  }

  if (hookStrategy !== "none") {
    const hookPath = getPreCommitHookPath(opts.cwd, hookStrategy)
    filesToWrite.push({
      action: getFileAction(
        hookPath,
        renderPreCommitHook(opts, packageManager),
      ),
      content: renderPreCommitHook(opts, packageManager),
      executable: true,
      filepath: hookPath,
    })
  }

  return filesToWrite
}

function getDependenciesToInstall(opts: InitOptions): string[] {
  const dependencies = ["eslint", "eslint-config-setup", "typescript"]

  if (opts.oxlint) {
    dependencies.push("oxlint")
  }

  if (opts.formatter === "oxfmt") {
    dependencies.push("oxfmt")
  }

  if (resolveHookStrategy(opts) === "husky") {
    dependencies.push("husky")
  }

  return dependencies
}

function getDependencyChanges(
  packageJson: ProjectPackageJson,
  opts: InitOptions,
): InitDependencyChange[] {
  return getDependenciesToInstall(opts).map((name) => ({
    action: hasDependencyInPackageJson(packageJson, name) ? "reuse" : "install",
    name,
  }))
}

function getScripts(opts: InitOptions): Record<string, string> {
  const hookStrategy = resolveHookStrategy(opts)
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

  if (hookStrategy === "native") {
    scripts["hooks:install"] = "git config core.hooksPath .githooks"
  }

  if (hookStrategy === "husky") {
    scripts.prepare = "husky"
  }

  return scripts
}

function getScriptChanges(
  packageJson: ProjectPackageJson,
  scripts: Record<string, string>,
): InitScriptChange[] {
  const existingScripts = packageJson.scripts ?? {}
  const changes: InitScriptChange[] = []

  for (const [name, value] of Object.entries(scripts)) {
    const existing = existingScripts[name]
    if (!existing) {
      changes.push({ action: "add", name })
      continue
    }

    if (existing !== value) {
      changes.push({ action: "update", name })
    }
  }

  return changes
}

function getConflicts(
  opts: InitOptions,
  packageJson: ProjectPackageJson,
  scripts: Record<string, string>,
  filesToWrite: PlannedFile[],
): InitConflict[] {
  const conflicts: InitConflict[] = []
  const packageScripts = packageJson.scripts ?? {}
  const forceHint = "Re-run with `--force` to replace it."
  const vscodePath = path.join(opts.cwd, ".vscode/settings.json")

  for (const [scriptName, scriptValue] of Object.entries(scripts)) {
    const existing = packageScripts[scriptName]
    if (existing && existing !== scriptValue) {
      conflicts.push({
        canForce: true,
        message: `Script "${scriptName}" already exists in package.json with different content. ${forceHint}`,
      })
    }
  }

  for (const file of filesToWrite) {
    if (file.filepath.endsWith("package.json")) {
      continue
    }

    if (file.filepath.endsWith("eslint.config.ts")) {
      const existingConfig = findEslintConfigFile(opts.cwd)
      if (existingConfig && existingConfig !== file.filepath) {
        conflicts.push({
          canForce: false,
          message: `Found existing ESLint config at ${existingConfig}. Rename or remove it before generating eslint.config.ts.`,
        })
        continue
      }
    }

    if (file.filepath.endsWith("oxlint.config.ts")) {
      const existingConfig = findOxlintConfigFile(opts.cwd)
      if (existingConfig && existingConfig !== file.filepath) {
        conflicts.push({
          canForce: false,
          message: `Found existing OxLint config at ${existingConfig}. Rename or remove it before generating oxlint.config.ts.`,
        })
        continue
      }
    }

    if (file.filepath === vscodePath) {
      const existing = readTextIfExists(vscodePath)
      if (!existing) {
        continue
      }

      try {
        const parsedExisting = JSON.parse(existing) as Record<string, unknown>
        const managedSettings = createVscodeSettingsTemplate(opts)

        for (const [key, value] of Object.entries(managedSettings)) {
          if (key in parsedExisting && JSON.stringify(parsedExisting[key]) !== JSON.stringify(value)) {
            conflicts.push({
              canForce: true,
              message: `.vscode/settings.json already defines "${key}" with a different value. ${forceHint}`,
            })
          }
        }
      } catch {
        conflicts.push({
          canForce: true,
          message: ".vscode/settings.json is not valid JSON. Re-run with `--force` to replace it.",
        })
      }

      continue
    }

    const existing = readTextIfExists(file.filepath)
    if (existing !== null && existing !== file.content) {
      conflicts.push({
        canForce: true,
        message: `${path.relative(opts.cwd, file.filepath) || path.basename(file.filepath)} already exists with different content. ${forceHint}`,
      })
    }
  }

  return conflicts
}

function installDependencies(
  cwd: string,
  packageManager: PackageManager,
  dependencies: string[],
): void {
  if (dependencies.length === 0) {
    return
  }

  const command = getInstallCommand(packageManager, dependencies)
  const result = spawnSync(command.bin, command.args, {
    cwd,
    stdio: "inherit",
  })

  if (result.status !== 0) {
    throw new Error(`Dependency installation failed with exit code ${result.status ?? 1}`)
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
  let existing: Record<string, unknown> = {}
  if (existingContent) {
    try {
      existing = JSON.parse(existingContent) as Record<string, unknown>
    } catch {
      existing = {}
    }
  }

  const settings: Record<string, unknown> = {
    ...existing,
    ...createVscodeSettingsTemplate(opts),
  }

  return `${JSON.stringify(settings, null, 2)}\n`
}

function getFileAction(
  filepath: string,
  content: string,
  existingAction: "merge" | "update" = "update",
): PlannedFile["action"] {
  const existing = readTextIfExists(filepath)

  if (existing === null) {
    return "create"
  }

  if (existing === content) {
    return "keep"
  }

  return existingAction
}

function getPreCommitHookPath(cwd: string, hookStrategy: HookStrategy): string {
  return hookStrategy === "husky"
    ? path.join(cwd, ".husky/pre-commit")
    : path.join(cwd, ".githooks/pre-commit")
}

function resolveHookStrategy(opts: InitOptions): HookStrategy {
  if (opts.hookStrategy) {
    return opts.hookStrategy
  }

  return opts.hooks ? "native" : "none"
}

function hasDependencyInPackageJson(
  packageJson: ProjectPackageJson,
  dependencyName: string,
): boolean {
  return Boolean(
    packageJson.dependencies?.[dependencyName]
    || packageJson.devDependencies?.[dependencyName],
  )
}

function formatConflictError(conflicts: InitConflict[]): string {
  const lines = [
    "Init found existing files or scripts that would be overwritten:",
    ...conflicts.map((conflict) => `- ${conflict.message}`),
  ]

  if (conflicts.some((conflict) => conflict.canForce)) {
    lines.push("Use `eslint-config-setup init --force` if you want to overwrite the replaceable targets.")
  }

  return lines.join("\n")
}
