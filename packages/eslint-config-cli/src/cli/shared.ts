import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import type { ConfigOptions } from "../types"

export interface CliResult {
  exitCode: number
  stderr: string[]
  stdout: string[]
}

export interface InitOptions extends ConfigOptions {
  agents?: boolean
  cwd: string
  dryRun?: boolean
  force?: boolean
  formatter?: "none" | "oxfmt"
  hooks?: boolean
  install?: boolean
  vscode?: boolean
}

export interface DoctorCheck {
  fix?: string
  level: "fail" | "pass" | "warn"
  message: string
}

export interface DoctorResult {
  checks: DoctorCheck[]
  exitCode: number
}

export interface ProjectPackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  engines?: Record<string, string>
  packageManager?: string
  scripts?: Record<string, string>
}

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn"

const ESLINT_CONFIG_FILENAMES = [
  "eslint.config.ts",
  "eslint.config.mts",
  "eslint.config.js",
  "eslint.config.mjs",
] as const

const OXLINT_CONFIG_FILENAMES = [
  "oxlint.config.ts",
  "oxlint.config.mts",
  "oxlint.config.js",
  "oxlint.config.mjs",
  ".oxlintrc.json",
] as const

export function detectPackageManager(
  cwd: string,
  packageJson: ProjectPackageJson | null,
): PackageManager {
  const manager = packageJson?.packageManager

  if (manager?.startsWith("pnpm@")) {
    return "pnpm"
  }

  if (manager?.startsWith("yarn@")) {
    return "yarn"
  }

  if (manager?.startsWith("bun@")) {
    return "bun"
  }

  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm"
  }

  if (existsSync(path.join(cwd, "bun.lockb")) || existsSync(path.join(cwd, "bun.lock"))) {
    return "bun"
  }

  if (existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn"
  }

  return "npm"
}

export function findEslintConfigFile(cwd: string): string | null {
  return findFirstExistingFile(cwd, ESLINT_CONFIG_FILENAMES)
}

export function findOxlintConfigFile(cwd: string): string | null {
  return findFirstExistingFile(cwd, OXLINT_CONFIG_FILENAMES)
}

export function formatInstallCommand(
  packageManager: PackageManager,
  dependencies: string[],
): string {
  const command = getInstallCommand(packageManager, dependencies)
  return [command.bin, ...command.args].join(" ")
}

export function formatConfigOptions(opts: ConfigOptions): string {
  const entries = Object.entries(opts).filter(([, value]) => value)

  if (entries.length === 0) {
    return "{}"
  }

  const lines = entries.map(([key]) => `  ${key}: true,`)
  return `{\n${lines.join("\n")}\n}`
}

export function readPackageJson(cwd: string): ProjectPackageJson | null {
  const packageJsonPath = path.join(cwd, "package.json")
  if (!existsSync(packageJsonPath)) {
    return null
  }

  return JSON.parse(readFileSync(packageJsonPath, "utf8")) as ProjectPackageJson
}

export function readTextIfExists(filepath: string): string | null {
  if (!existsSync(filepath)) {
    return null
  }

  return readFileSync(filepath, "utf8")
}

export function writeJsonFile(filepath: string, value: unknown): void {
  writeFileSync(filepath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

export function writeTextFile(filepath: string, content: string): void {
  writeFileSync(filepath, content, "utf8")
}

export function hasDependency(
  packageJson: ProjectPackageJson | null,
  dependencyName: string,
): boolean {
  return Boolean(
    packageJson?.dependencies?.[dependencyName]
      || packageJson?.devDependencies?.[dependencyName],
  )
}

export function parseMajorVersion(version: string): number | null {
  const match = version.match(/(\d+)/)
  return match ? Number(match[1]) : null
}

export function getInstallCommand(
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

export function getRunCommand(packageManager: PackageManager): string {
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

function findFirstExistingFile(
  cwd: string,
  filenames: readonly string[],
): string | null {
  for (const filename of filenames) {
    const filepath = path.join(cwd, filename)
    if (existsSync(filepath)) {
      return filepath
    }
  }

  return null
}
