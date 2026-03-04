import { describe, expect, it } from "vitest"

import { getEslintConfig, getOxlintConfig } from "../loader"

describe("getEslintConfig", () => {
  it("throws with a descriptive error for missing config files", async () => {
    // The pre-generated config files don't exist in test context (src/, not dist/)
    await expect(getEslintConfig({})).rejects.toThrow(
      "eslint-config-setup: No pre-generated config found",
    )
  })

  it("includes the expected filename in the error", async () => {
    await expect(getEslintConfig({ react: true })).rejects.toThrow("configs/")
  })

  it("includes the options in the error message", async () => {
    await expect(getEslintConfig({ react: true })).rejects.toThrow('"react":true')
  })
})

describe("getOxlintConfig", () => {
  it("throws with a descriptive error for missing config files", () => {
    expect(() => getOxlintConfig({})).toThrow(
      "eslint-config-setup: No pre-generated OxLint config found",
    )
  })

  it("includes the expected filename in the error", () => {
    expect(() => getOxlintConfig({ react: true })).toThrow("oxlint-configs/")
  })

  it("includes the options in the error message", () => {
    expect(() => getOxlintConfig({ react: true })).toThrow('"react":true')
  })
})
