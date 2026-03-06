#!/usr/bin/env node

import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { runDoctor } from "./cli/doctor"
import { runInit } from "./cli/init"

export async function runCli(argv: string[]): Promise<number> {
  const [command, ...rest] = argv

  switch (command) {
    case "doctor":
      return handleDoctor(rest)
    case "init":
      return handleInit(rest)
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
    for (const check of result.checks) {
      const prefix = check.level.toUpperCase().padEnd(4, " ")
      const stream = check.level === "fail" ? console.error : console.log
      stream(`${prefix} ${check.message}`)
    }
    return result.exitCode
  }

  return 0
}

function handleInit(argv: string[]): number {
  const parsed = parseArgs({
    allowPositionals: false,
    args: argv,
    options: {
      agents: { type: "boolean" },
      ai: { type: "boolean" },
      "dry-run": { type: "boolean" },
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

  const outcome = runInit({
    agents: parsed.values.agents ?? false,
    ai: parsed.values.ai ?? false,
    cwd: process.cwd(),
    dryRun: parsed.values["dry-run"] ?? false,
    formatter: (formatter as "none" | "oxfmt" | undefined) ?? "none",
    hooks: parsed.values.hooks ?? false,
    install: parsed.values.install ?? false,
    node: parsed.values.node ?? false,
    oxlint: parsed.values.oxlint ?? false,
    react: parsed.values.react ?? false,
    vscode: parsed.values.vscode ?? false,
  })

  console.log(`Configured project using ${outcome.packageManager}.`)
  console.log(`Updated scripts: ${outcome.scripts.join(", ")}`)
  console.log(`Touched files: ${outcome.files.join(", ")}`)

  if (!parsed.values.install) {
    console.log(`Install dependencies manually: ${outcome.installedDependencies.join(" ")}`)
  }

  return 0
}

function printUsage(): void {
  console.log(`eslint-config-setup CLI

Usage:
  eslint-config-setup init [--react] [--node] [--ai] [--oxlint] [--vscode] [--agents]
  eslint-config-setup doctor
`)
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
