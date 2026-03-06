import { describe, expect, it } from "vitest"

import { formatDoctorReport } from "../cli/doctor-report"

describe("formatDoctorReport", () => {
  it("renders a structured success report", () => {
    const report = formatDoctorReport({
      checks: [
        { level: "pass", message: "Found eslint.config.ts." },
        { level: "pass", message: "TypeScript dependency found." },
      ],
      exitCode: 0,
    })

    expect(report).toContain("Doctor summary: setup looks usable.")
    expect(report).toContain("Passed 2, warned 0, failed 0.")
    expect(report).toContain("**Verified**")
    expect(report).toContain("PASS Found eslint.config.ts.")
  })

  it("renders failures and warnings with fix hints", () => {
    const report = formatDoctorReport({
      checks: [
        {
          fix: "Install it with: pnpm add -D eslint-config-setup",
          level: "fail",
          message: "Missing eslint-config-setup dependency.",
        },
        {
          fix: "Add a check script.",
          level: "warn",
          message: "No check script found.",
        },
        { level: "pass", message: "Found eslint.config.ts." },
      ],
      exitCode: 1,
    })

    expect(report).toContain("Doctor summary: setup needs attention.")
    expect(report).toContain("**Failures**")
    expect(report).toContain("FAIL Missing eslint-config-setup dependency.")
    expect(report).toContain("Fix: Install it with: pnpm add -D eslint-config-setup")
    expect(report).toContain("**Warnings**")
    expect(report).toContain("WARN No check script found.")
    expect(report).toContain("**Verified**")
  })
})
