/* eslint-disable security/detect-non-literal-fs-filename -- Test fixtures are written to deterministic paths under the package test directory. */
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import { optionsToFilename } from "../hash"
import { getEslintConfig, getOxlintConfig } from "../loader"

const configsDir = path.join(import.meta.dirname, "..", "configs")
const generatedTestFiles = new Set<string>()

afterEach(() => {
  for (const file of generatedTestFiles) {
    rmSync(file, { force: true })
  }
  generatedTestFiles.clear()
})

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

  it("preserves the cause when an existing config fails to import", async () => {
    const opts = { node: true }
    const configPath = writeGeneratedConfig(
      optionsToFilename(opts),
      'throw new Error("plugin exploded during evaluation")',
    )

    await expect(getEslintConfig(opts)).rejects.toThrow(
      "Pre-generated config failed to load",
    )
    await expect(getEslintConfig(opts)).rejects.toThrow(
      "plugin exploded during evaluation",
    )
    await expect(getEslintConfig(opts)).rejects.toMatchObject({
      cause: expect.any(Error),
      message: expect.stringContaining(path.basename(configPath)),
    })
  })
})

function writeGeneratedConfig(filename: string, source: string): string {
  mkdirSync(configsDir, { recursive: true })
  const configPath = path.join(configsDir, filename)
  writeFileSync(configPath, source)
  generatedTestFiles.add(configPath)
  return configPath
}

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
