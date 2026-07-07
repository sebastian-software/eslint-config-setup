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

    let thrown: unknown
    try {
      await getEslintConfig(opts)
    }
    catch (error) {
      thrown = error
    }

    assertError(thrown)
    expect(thrown.message).toContain("Pre-generated config failed to load")
    expect(thrown.message).toContain(path.basename(configPath))
    assertError(thrown.cause)
    expect(thrown.cause.message).toBe("plugin exploded during evaluation")
  })

  it("reports a config as missing when it disappears before import completes", async () => {
    const opts = { ai: true }
    writeGeneratedConfig(
      optionsToFilename(opts),
      `
        import { rmSync } from "node:fs"

        const currentModule = new URL(import.meta.url)
        currentModule.search = ""
        rmSync(currentModule)
        throw new Error("removed during import")
      `,
    )

    await expect(getEslintConfig(opts)).rejects.toThrow(
      "eslint-config-setup: No pre-generated config found",
    )
    await expect(getEslintConfig(opts)).rejects.not.toThrow(
      "Pre-generated config failed to load",
    )
  })
})

function writeGeneratedConfig(filename: string, source: string): string {
  mkdirSync(configsDir, { recursive: true })
  const configPath = path.join(configsDir, filename)
  writeFileSync(configPath, source)
  generatedTestFiles.add(configPath)
  return configPath
}

function assertError(value: unknown): asserts value is Error {
  expect(value).toBeInstanceOf(Error)
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
