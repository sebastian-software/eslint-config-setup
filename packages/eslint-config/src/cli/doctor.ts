import path from "node:path"

import type { DoctorResult } from "./shared"

import {
  findEslintConfigFile,
  findOxlintConfigFile,
  hasDependency,
  parseMajorVersion,
  readPackageJson,
  readTextIfExists,
} from "./shared"

export function runDoctor(cwd: string): DoctorResult {
  const checks = []
  const packageJson = readPackageJson(cwd)

  if (!packageJson) {
    return {
      checks: [{ level: "fail", message: "No package.json found." }],
      exitCode: 1,
    }
  }

  const eslintConfigFile = findEslintConfigFile(cwd)
  const oxlintConfigFile = findOxlintConfigFile(cwd)
  const agentsPath = path.join(cwd, "AGENTS.md")
  const vscodePath = path.join(cwd, ".vscode/settings.json")
  const preCommitHookPath = path.join(cwd, ".githooks/pre-commit")
  const eslintConfigContent = eslintConfigFile ? readTextIfExists(eslintConfigFile) : null
  const agentsContent = readTextIfExists(agentsPath)
  const vscodeContent = readTextIfExists(vscodePath)
  const preCommitHookContent = readTextIfExists(preCommitHookPath)
  const usesAi = Boolean(eslintConfigContent?.match(/\bai\s*:\s*true\b/))
  const usesOxlint = Boolean(eslintConfigContent?.match(/\boxlint\s*:\s*true\b/))

  checks.push(
    hasDependency(packageJson, "eslint-config-setup")
      ? { level: "pass" as const, message: "eslint-config-setup dependency found." }
      : { level: "fail" as const, message: "Missing eslint-config-setup dependency." },
  )

  checks.push(
    hasDependency(packageJson, "eslint")
      ? { level: "pass" as const, message: "ESLint dependency found." }
      : { level: "fail" as const, message: "Missing ESLint dependency." },
  )

  checks.push(
    hasDependency(packageJson, "typescript")
      ? { level: "pass" as const, message: "TypeScript dependency found." }
      : { level: "fail" as const, message: "Missing TypeScript dependency." },
  )

  checks.push(
    eslintConfigFile
      ? { level: "pass" as const, message: `Found ${path.basename(eslintConfigFile)}.` }
      : { level: "fail" as const, message: "No eslint.config.* file found." },
  )

  if (eslintConfigContent && !eslintConfigContent.includes("getEslintConfig")) {
    checks.push({
      level: "warn" as const,
      message: "ESLint config does not appear to use getEslintConfig().",
    })
  }

  if (usesOxlint) {
    checks.push(
      hasDependency(packageJson, "oxlint")
        ? { level: "pass" as const, message: "OxLint dependency found." }
        : { level: "fail" as const, message: "ESLint config enables oxlint, but oxlint is not installed." },
    )

    checks.push(
      oxlintConfigFile
        ? { level: "pass" as const, message: `Found ${path.basename(oxlintConfigFile)}.` }
        : { level: "fail" as const, message: "ESLint config enables oxlint, but no oxlint config file was found." },
    )

    const lintScript = packageJson.scripts?.lint ?? ""
    if (!lintScript.includes("oxlint")) {
      checks.push({
        level: "warn" as const,
        message: "Lint script does not include oxlint even though oxlint is enabled in ESLint config.",
      })
    }
  }

  const formatScript = packageJson.scripts?.format ?? ""
  const checkScript = packageJson.scripts?.check ?? ""
  const hooksInstallScript = packageJson.scripts?.["hooks:install"] ?? ""
  if (formatScript.includes("oxfmt")) {
    checks.push(
      hasDependency(packageJson, "oxfmt")
        ? { level: "pass" as const, message: "oxfmt dependency found." }
        : { level: "fail" as const, message: "Format script references oxfmt, but oxfmt is not installed." },
    )

    if (!checkScript.includes("oxfmt")) {
      checks.push({
        level: "warn" as const,
        message: "Format script uses oxfmt, but the check script does not verify formatting.",
      })
    }

    if (vscodeContent && !vscodeContent.includes('"editor.formatOnSave": true')) {
      checks.push({
        level: "warn" as const,
        message: "VS Code settings exist, but editor.formatOnSave is not enabled for the oxfmt workflow.",
      })
    }
  }

  if (!packageJson.scripts?.check) {
    checks.push({
      level: "warn" as const,
      message: "No check script found. Add one for CI and local verification.",
    })
  }

  if (usesAi) {
    checks.push(
      agentsContent
        ? { level: "pass" as const, message: "Found AGENTS.md for agent-facing verification instructions." }
        : { level: "warn" as const, message: "AI mode is enabled, but AGENTS.md is missing." },
    )
  }

  if (agentsContent && !agentsContent.includes("run `") && !agentsContent.includes("run ")) {
    checks.push({
      level: "warn" as const,
      message: "AGENTS.md exists, but it does not appear to contain an explicit verification command.",
    })
  }

  if (hooksInstallScript && !preCommitHookContent) {
    checks.push({
      level: "fail" as const,
      message: "hooks:install is present, but .githooks/pre-commit is missing.",
    })
  }

  if (preCommitHookContent && !hooksInstallScript) {
    checks.push({
      level: "warn" as const,
      message: ".githooks/pre-commit exists, but package.json has no hooks:install script.",
    })
  }

  const nodeMajor = parseMajorVersion(process.versions.node)
  if (nodeMajor !== null && nodeMajor >= 22) {
    checks.push({
      level: "pass" as const,
      message: `Node.js ${process.versions.node} satisfies the >=22 requirement.`,
    })
  } else {
    checks.push({
      level: "fail" as const,
      message: `Node.js ${process.versions.node} does not satisfy the >=22 requirement.`,
    })
  }

  return {
    checks,
    exitCode: checks.some((check) => check.level === "fail") ? 1 : 0,
  }
}
