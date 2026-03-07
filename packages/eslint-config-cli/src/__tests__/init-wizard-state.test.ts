import { describe, expect, it } from "vitest"

import {
  createDefaultWizardState,
  getStepAnswerSummary,
  toInitOptions,
} from "../cli/init-wizard-state"

describe("init wizard state", () => {
  it("creates sensible defaults", () => {
    const state = createDefaultWizardState()

    expect(state.react).toBe(true)
    expect(state.vscode).toBe(true)
    expect(state.agents).toBe(true)
    expect(state.formatter).toBe("none")
    expect(state.hookStrategy).toBe("none")
  })

  it("formats step summaries and init options", () => {
    const state = {
      agents: true,
      ai: true,
      formatter: "oxfmt" as const,
      hookStrategy: "husky" as const,
      install: true,
      node: true,
      oxlint: true,
      react: true,
      vscode: false,
    }

    expect(getStepAnswerSummary("profile", state)).toBe("React, Node.js, AI mode, OxLint")
    expect(getStepAnswerSummary("editor", state)).toBe("No editor files")
    expect(getStepAnswerSummary("hooks", state)).toBe("Husky pre-commit")

    expect(toInitOptions("/tmp/project", state)).toEqual({
      agents: true,
      ai: true,
      cwd: "/tmp/project",
      formatter: "oxfmt",
      hookStrategy: "husky",
      install: true,
      node: true,
      oxlint: true,
      react: true,
      vscode: false,
    })
  })
})
