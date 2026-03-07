import path from "node:path"

import type { DoctorResult, HookStrategy, PackageManager, ProjectPackageJson } from "./shared"

import { previewInit } from "./init"
import {
  detectPackageManager,
  formatInstallCommand,
  findEslintConfigFile,
  findOxlintConfigFile,
  getCliCommand,
  getRunCommand,
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

  const packageManager = detectPackageManager(cwd, packageJson)
  const installDevDeps = (...dependencies: string[]) =>
    formatInstallCommand(packageManager, dependencies)
  const cli = getCliCommand(packageManager)
  const run = getRunCommand(packageManager)
  const hookStrategy = detectHookStrategy(packageJson, cwd)
  const eslintConfigFile = findEslintConfigFile(cwd)
  const oxlintConfigFile = findOxlintConfigFile(cwd)
  const agentsPath = path.join(cwd, "AGENTS.md")
  const vscodePath = path.join(cwd, ".vscode/settings.json")
  const preCommitHookPath = hookStrategy === "husky"
    ? path.join(cwd, ".husky/pre-commit")
    : path.join(cwd, ".githooks/pre-commit")
  const eslintConfigContent = eslintConfigFile ? readTextIfExists(eslintConfigFile) : null
  const agentsContent = readTextIfExists(agentsPath)
  const vscodeContent = readTextIfExists(vscodePath)
  const preCommitHookContent = readTextIfExists(preCommitHookPath)
  const usesAi = Boolean(eslintConfigContent?.match(/\bai\s*:\s*true\b/))
  const usesNode = Boolean(eslintConfigContent?.match(/\bnode\s*:\s*true\b/))
  const usesOxlint = Boolean(eslintConfigContent?.match(/\boxlint\s*:\s*true\b/))
  const usesReact = Boolean(eslintConfigContent?.match(/\breact\s*:\s*true\b/))
  const usesOxfmt = Boolean(
    packageJson.scripts?.format?.includes("oxfmt")
      || packageJson.scripts?.check?.includes("oxfmt")
      || packageJson.scripts?.fix?.includes("oxfmt")
      || packageJson.scripts?.["format:check"]?.includes("oxfmt"),
  )

  checks.push(
    hasDependency(packageJson, "eslint-config-setup")
      ? { level: "pass" as const, message: "eslint-config-setup dependency found." }
      : {
          fix: `Install it with: ${installDevDeps("eslint-config-setup")}`,
          level: "fail" as const,
          message: "Missing eslint-config-setup dependency.",
        },
  )

  checks.push(
    hasDependency(packageJson, "eslint")
      ? { level: "pass" as const, message: "ESLint dependency found." }
      : {
          fix: `Install it with: ${installDevDeps("eslint")}`,
          level: "fail" as const,
          message: "Missing ESLint dependency.",
        },
  )

  checks.push(
    hasDependency(packageJson, "typescript")
      ? { level: "pass" as const, message: "TypeScript dependency found." }
      : {
          fix: `Install it with: ${installDevDeps("typescript")}`,
          level: "fail" as const,
          message: "Missing TypeScript dependency.",
        },
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
        : {
            fix: `Install it with: ${installDevDeps("oxlint")}`,
            level: "fail" as const,
            message: "ESLint config enables oxlint, but oxlint is not installed.",
          },
    )

    checks.push(
      oxlintConfigFile
        ? { level: "pass" as const, message: `Found ${path.basename(oxlintConfigFile)}.` }
        : {
            fix: `Create one with \`${formatInitCommand(cli, { oxlint: true }, ["--dry-run"])}\` and apply the generated file.`,
            level: "fail" as const,
            message: "ESLint config enables oxlint, but no oxlint config file was found.",
          },
    )

    const lintScript = packageJson.scripts?.lint ?? ""
    if (!lintScript.includes("oxlint")) {
      checks.push({
        fix: `Update the lint script so it includes oxlint, for example: ${run} check`,
        level: "warn" as const,
        message: "Lint script does not include oxlint even though oxlint is enabled in ESLint config.",
      })
    }
  }

  const formatScript = packageJson.scripts?.format ?? ""
  const checkScript = packageJson.scripts?.check ?? ""
  const prepareScript = packageJson.scripts?.prepare ?? ""
  const hooksInstallScript = packageJson.scripts?.["hooks:install"] ?? ""
  if (formatScript.includes("oxfmt")) {
    checks.push(
      hasDependency(packageJson, "oxfmt")
        ? { level: "pass" as const, message: "oxfmt dependency found." }
        : {
            fix: `Install it with: ${installDevDeps("oxfmt")}`,
            level: "fail" as const,
            message: "Format script references oxfmt, but oxfmt is not installed.",
          },
    )

    if (!checkScript.includes("oxfmt")) {
      checks.push({
        fix: `Include formatting in the quality gate, for example by making \`check\` run oxfmt before linting.`,
        level: "warn" as const,
        message: "Format script uses oxfmt, but the check script does not verify formatting.",
      })
    }

    if (vscodeContent && !vscodeContent.includes('"editor.formatOnSave": true')) {
      checks.push({
        fix: "Enable editor.formatOnSave in .vscode/settings.json or remove the partial VS Code companion setup.",
        level: "warn" as const,
        message: "VS Code settings exist, but editor.formatOnSave is not enabled for the oxfmt workflow.",
      })
    }
  }

  if (!packageJson.scripts?.check) {
    checks.push({
          fix: "Add a check script so local development and CI use the same verification path.",
          level: "warn" as const,
          message: "No check script found. Add one for CI and local verification.",
        })
  }

  if (usesAi) {
    checks.push(
      agentsContent
        ? { level: "pass" as const, message: "Found AGENTS.md for agent-facing verification instructions." }
        : {
            fix: `Generate one with \`${formatInitCommand(cli, { agents: true }, ["--dry-run"])}\` and apply the result.`,
            level: "warn" as const,
            message: "AI mode is enabled, but AGENTS.md is missing.",
          },
    )
  }

  if (agentsContent && !agentsContent.includes("run `") && !agentsContent.includes("run ")) {
    checks.push({
      fix: `Add a concrete verification command such as \`${run} check\` to AGENTS.md.`,
      level: "warn" as const,
      message: "AGENTS.md exists, but it does not appear to contain an explicit verification command.",
    })
  }

  addHookChecks({
    checks,
    cli,
    cwd,
    hookStrategy,
    packageJson,
    preCommitHookContent,
    prepareScript,
    hooksInstallScript,
  })

  if (eslintConfigContent?.includes("getEslintConfig")) {
    const preview = previewInit({
      agents: Boolean(agentsContent),
      ai: usesAi,
      cwd,
      dryRun: true,
      formatter: usesOxfmt ? "oxfmt" : "none",
      hookStrategy,
      node: usesNode,
      oxlint: usesOxlint,
      react: usesReact,
      vscode: Boolean(vscodeContent),
    })

    for (const conflict of getDoctorDriftConflicts(preview.conflicts)) {
      checks.push({
        fix: `Compare with \`${formatInitCommand(cli, {
          agents: Boolean(agentsContent),
          ai: usesAi,
          formatter: usesOxfmt ? "oxfmt" : "none",
          hookStrategy,
          node: usesNode,
          oxlint: usesOxlint,
          react: usesReact,
          vscode: Boolean(vscodeContent),
        }, ["--dry-run"])}\`, then re-run with \`--force\` if you want to replace the generated targets.`,
        level: "warn" as const,
        message: conflict,
      })
    }
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

function formatInitCommand(
  cli: string,
  options: {
    agents?: boolean
    ai?: boolean
    formatter?: "none" | "oxfmt"
    hookStrategy?: HookStrategy
    node?: boolean
    oxlint?: boolean
    react?: boolean
    vscode?: boolean
  },
  extraFlags: string[] = [],
): string {
  const flags = [
    options.react ? "--react" : null,
    options.node ? "--node" : null,
    options.ai ? "--ai" : null,
    options.oxlint ? "--oxlint" : null,
    options.formatter === "oxfmt" ? "--formatter oxfmt" : null,
    options.vscode ? "--vscode" : null,
    options.agents ? "--agents" : null,
    options.hookStrategy === "native" ? "--hooks" : null,
    options.hookStrategy === "husky" ? "--hook-provider husky" : null,
    ...extraFlags,
  ].filter(Boolean)

  return [cli, "init", ...flags].join(" ")
}

function getDoctorDriftConflicts(conflicts: Array<{ message: string }>): string[] {
  return conflicts.flatMap((conflict) => {
    if (conflict.message.startsWith("Script \"")) {
      return [`Init-managed package scripts drift from the current generated defaults. ${conflict.message}`]
    }

    if (
      conflict.message.startsWith("AGENTS.md")
      || conflict.message.startsWith(".vscode/settings.json")
      || conflict.message.startsWith(".githooks/pre-commit")
      || conflict.message.startsWith(".husky/pre-commit")
    ) {
      return [`Init-managed companion files drift from the current generated defaults. ${conflict.message}`]
    }

  return []
  })
}

function addHookChecks({
  checks,
  cli,
  cwd,
  hookStrategy,
  hooksInstallScript,
  packageJson,
  preCommitHookContent,
  prepareScript,
}: {
  checks: DoctorResult["checks"]
  cli: string
  cwd: string
  hookStrategy: HookStrategy
  hooksInstallScript: string
  packageJson: ProjectPackageJson
  preCommitHookContent: string | null
  prepareScript: string
}) {
  if (hookStrategy === "native") {
    if (hooksInstallScript && !preCommitHookContent) {
      checks.push({
        fix: `Create .githooks/pre-commit or remove \`hooks:install\` from package.json.`,
        level: "fail" as const,
        message: "hooks:install is present, but .githooks/pre-commit is missing.",
      })
    }

    if (preCommitHookContent && !hooksInstallScript) {
      checks.push({
        fix: "Add a hooks:install script or remove the orphaned pre-commit hook file.",
        level: "warn" as const,
        message: ".githooks/pre-commit exists, but package.json has no hooks:install script.",
      })
    }

    return
  }

  if (hookStrategy === "husky") {
    checks.push(
      hasDependency(packageJson, "husky")
        ? { level: "pass" as const, message: "Husky dependency found." }
        : {
            fix: `Install it with: ${formatInstallCommand(detectPackageManager(cwd, packageJson), ["husky"])}`,
            level: "fail" as const,
            message: "Husky hook setup is present, but husky is not installed.",
          },
    )

    if (!prepareScript.includes("husky")) {
      checks.push({
        fix: `Add a \`prepare\` script or re-run \`${formatInitCommand(cli, { hookStrategy: "husky" }, ["--dry-run"])}\` to compare the generated setup.`,
        level: "warn" as const,
        message: "Husky pre-commit hook exists, but package.json does not contain a husky prepare script.",
      })
    }

    if (!preCommitHookContent) {
      checks.push({
        fix: `Create .husky/pre-commit or re-run \`${formatInitCommand(cli, { hookStrategy: "husky" }, ["--dry-run"])}\` to compare the generated setup.`,
        level: "fail" as const,
        message: "Husky setup is enabled, but .husky/pre-commit is missing.",
      })
    }
  }
}

function detectHookStrategy(
  packageJson: ProjectPackageJson,
  cwd: string,
): HookStrategy {
  if (
    readTextIfExists(path.join(cwd, ".husky/pre-commit"))
    || packageJson.scripts?.prepare?.includes("husky")
    || hasDependency(packageJson, "husky")
  ) {
    return "husky"
  }

  if (
    readTextIfExists(path.join(cwd, ".githooks/pre-commit"))
    || packageJson.scripts?.["hooks:install"]
  ) {
    return "native"
  }

  return "none"
}
