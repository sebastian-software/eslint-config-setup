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
  const eslintConfigContent = eslintConfigFile ? readTextIfExists(eslintConfigFile) : null
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
  if (formatScript.includes("oxfmt")) {
    checks.push(
      hasDependency(packageJson, "oxfmt")
        ? { level: "pass" as const, message: "oxfmt dependency found." }
        : { level: "fail" as const, message: "Format script references oxfmt, but oxfmt is not installed." },
    )
  }

  if (!packageJson.scripts?.check) {
    checks.push({
      level: "warn" as const,
      message: "No check script found. Add one for CI and local verification.",
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
