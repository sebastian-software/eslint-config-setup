#!/usr/bin/env node

import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { runDoctor } from "./cli/doctor"
import { formatDoctorReport } from "./cli/doctor-report"
import { runInit } from "./cli/init"
import { runInitWizard } from "./cli/init-wizard"

export async function runCli(argv: string[]): Promise<number> {
  const [command, ...rest] = argv

  switch (command) {
    case "doctor":
      return handleDoctor(rest)
    case "init":
      return await handleInit(rest)
    default:
      printUsage()
      return command ? 1 : 0
  }
}

function handleDoctor(argv: string[]): number {
  const parsed = parseArgs({
    allowPositionals: false,
    args: argv,
    options: {},
    strict: true,
  })

  if (parsed.values) {
    const result = runDoctor(process.cwd())
    const report = formatDoctorReport(result)
    const stream = result.exitCode === 0 ? console.log : console.error
    stream(report.trimEnd())
    return result.exitCode
  }

  return 0
}

async function handleInit(argv: string[]): Promise<number> {
  const parsed = parseArgs({
    allowPositionals: false,
    args: argv,
    options: {
      agents: { type: "boolean" },
      ai: { type: "boolean" },
      "dry-run": { type: "boolean" },
      force: { type: "boolean" },
      formatter: { type: "string" },
      hooks: { type: "boolean" },
      install: { type: "boolean" },
      node: { type: "boolean" },
      oxlint: { type: "boolean" },
      react: { type: "boolean" },
      vscode: { type: "boolean" },
    },
    strict: true,
  })

  const formatter = parsed.values.formatter
  if (formatter && formatter !== "none" && formatter !== "oxfmt") {
    console.error(`Unsupported formatter "${formatter}". Use "none" or "oxfmt".`)
    return 1
  }

  if (shouldUseWizard(parsed.values)) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      console.error("Interactive init requires a TTY. Pass flags explicitly instead.")
      return 1
    }

    const outcome = await runInitWizard(process.cwd(), { force: parsed.values.force ?? false })
    if (!outcome) {
      console.log("Init cancelled.")
      return 1
    }

    printInitOutcome(outcome, parsed.values.install ?? false)
    return 0
  }

  const outcome = runInit({
    agents: parsed.values.agents ?? false,
    ai: parsed.values.ai ?? false,
    cwd: process.cwd(),
    dryRun: parsed.values["dry-run"] ?? false,
    force: parsed.values.force ?? false,
    formatter: (formatter as "none" | "oxfmt" | undefined) ?? "none",
    hooks: parsed.values.hooks ?? false,
    install: parsed.values.install ?? false,
    node: parsed.values.node ?? false,
    oxlint: parsed.values.oxlint ?? false,
    react: parsed.values.react ?? false,
    vscode: parsed.values.vscode ?? false,
  })

  printInitOutcome(outcome, parsed.values.install ?? false)
  return 0
}

function printUsage(): void {
  console.log(`eslint-config-setup-cli

Usage:
  eslint-config-setup-cli init
  eslint-config-setup-cli init [--react] [--node] [--ai] [--oxlint] [--formatter oxfmt] [--vscode] [--agents] [--hooks] [--install] [--force]
  eslint-config-setup-cli doctor
`)
}

function printInitOutcome(
  outcome: ReturnType<typeof runInit>,
  installDependencies: boolean,
): void {
  console.log(`Configured project using ${outcome.packageManager}.`)
  console.log(`Updated scripts: ${outcome.scripts.join(", ")}`)
  console.log(`Touched files: ${outcome.files.join(", ")}`)

  if (!installDependencies) {
    console.log(`Install dependencies manually: ${outcome.installCommand}`)
  }
}

function shouldUseWizard(
  values: Record<string, boolean | string | undefined>,
): boolean {
  return ![
    values.agents,
    values.ai,
    values["dry-run"],
    values.hooks,
    values.install,
    values.node,
    values.oxlint,
    values.react,
    values.vscode,
    values.formatter,
  ].some(Boolean)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli(process.argv.slice(2))
    .then((exitCode) => {
      process.exitCode = exitCode
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      console.error(message)
      process.exitCode = 1
    })
}
