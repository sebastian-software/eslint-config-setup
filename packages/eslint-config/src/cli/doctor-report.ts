import type { DoctorCheck, DoctorResult } from "./shared"

export function formatDoctorReport(result: DoctorResult): string {
  const failed = result.checks.filter((check) => check.level === "fail")
  const warned = result.checks.filter((check) => check.level === "warn")
  const passed = result.checks.filter((check) => check.level === "pass")

  const lines = [
    result.exitCode === 0
      ? "Doctor summary: setup looks usable."
      : "Doctor summary: setup needs attention.",
    `Passed ${passed.length}, warned ${warned.length}, failed ${failed.length}.`,
  ]

  if (failed.length > 0) {
    lines.push("", "**Failures**")
    lines.push(...formatChecks("FAIL", failed))
  }

  if (warned.length > 0) {
    lines.push("", "**Warnings**")
    lines.push(...formatChecks("WARN", warned))
  }

  if (passed.length > 0) {
    lines.push("", "**Verified**")
    lines.push(...passed.map((check) => `PASS ${check.message}`))
  }

  return `${lines.join("\n")}\n`
}

function formatChecks(
  label: "FAIL" | "WARN",
  checks: DoctorCheck[],
): string[] {
  return checks.flatMap((check) => {
    const lines = [`${label} ${check.message}`]

    if (check.fix) {
      lines.push(`     Fix: ${check.fix}`)
    }

    return lines
  })
}
