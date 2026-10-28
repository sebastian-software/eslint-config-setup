/* eslint-disable security/detect-non-literal-fs-filename -- Test fixtures are written to deterministic paths under the package test directory. */
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import type { ConfigOptions } from "../types"

import { optionsToFilename } from "../hash"
import { getEslintConfig, getOxlintConfig } from "../loader"
import { captureError, captureRejection } from "./helpers/capture"

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

describe("getEslintConfig spellcheck option", () => {
  const configured = {
    words: ["SecretWordAlpha"],
    dictionaries: ["secret-dict-beta"],
    import: ["@secret/import-gamma/cspell-ext.json"],
    language: "xx-delta",
  }
  const configuredValues = ["SecretWordAlpha", "secret-dict-beta", "import-gamma", "xx-delta"]
  const baseOptions = { checkComments: true, checkIdentifiers: true, checkStrings: false, autoFix: false }

  const stubConfig = (): string => `
    export default [{
      name: "eslint-config-setup/base",
      plugins: { "@cspell": {} },
      rules: { "@cspell/spellchecker": ["warn", ${JSON.stringify(baseOptions)}] },
    }]
  `

  it.each<unknown>([null, "de", ["x"]])("throws a TypeError for %j", async (value) => {
    // @ts-expect-error -- deliberately invalid input from an untyped JS config
    const thrown = await captureRejection(async () => getEslintConfig({ spellcheck: value }))
    expect(thrown).toBeInstanceOf(TypeError)
    expect(thrown.message).toContain("spellcheck")
    expect(thrown.message).not.toContain('"de"')
  })

  it("returns the loaded config unchanged for undefined, {} and spellcheck: true", async () => {
    writeGeneratedConfig(optionsToFilename({}), stubConfig())
    const results = await Promise.all([
      getEslintConfig(),
      getEslintConfig({}),
      getEslintConfig({ spellcheck: true }),
    ])
    for (const result of results) {
      expect(result).toHaveLength(1)
      expect(result[0].rules?.["@cspell/spellchecker"]).toStrictEqual(["warn", baseOptions])
    }
  })

  it("redacts configured values in the missing-config message", async () => {
    const { message } = await captureRejection(async () => getEslintConfig({ react: true, spellcheck: configured }))
    expect(message).toContain("No pre-generated config found")
    expect(message).toContain('"<configured>"')
    expect(message).toContain('"react":true')
    for (const value of configuredValues) expect(message).not.toContain(value)
  })

  it("prints a boolean spellcheck as is", async () => {
    await expect(getEslintConfig({ react: true, spellcheck: false })).rejects.toThrow(
      '"spellcheck":false',
    )
  })

  it("redacts configured values in the load-failure message", async () => {
    const opts = { node: true, spellcheck: configured }
    writeGeneratedConfig(optionsToFilename(opts), 'throw new Error("boom")')
    const { message } = await captureRejection(async () => getEslintConfig(opts))
    expect(message).toContain("Pre-generated config failed to load")
    expect(message).toContain('"<configured>"')
    expect(message).toContain('"node":true')
    for (const value of configuredValues) expect(message).not.toContain(value)
  })

  it("reports transform errors as such, not as load failures", async () => {
    writeGeneratedConfig(optionsToFilename({}), "export default [{ name: 'x', rules: {} }]")
    const { message } = await captureRejection(async () => getEslintConfig({ spellcheck: { words: ["SecretWordAlpha"] } }))
    expect(message).toContain("@cspell/spellchecker")
    expect(message).not.toContain("failed to load")
    expect(message).not.toContain("SecretWordAlpha")
  })

  it("yields independent results for concurrent calls with different spellcheck values", async () => {
    writeGeneratedConfig(optionsToFilename({}), stubConfig())
    const [off, withWords, withOther] = await Promise.all([
      getEslintConfig({ spellcheck: false }),
      getEslintConfig({ spellcheck: { words: ["one"] } }),
      getEslintConfig({ spellcheck: { words: ["two"], checkIdentifiers: false } }),
    ])
    expect(off[0].rules?.["@cspell/spellchecker"]).toBeUndefined()
    expect(withWords[0].rules?.["@cspell/spellchecker"]).toStrictEqual([
      "warn",
      { ...baseOptions, cspell: { words: ["one"] } },
    ])
    expect(withOther[0].rules?.["@cspell/spellchecker"]).toStrictEqual([
      "warn",
      { ...baseOptions, checkIdentifiers: false, cspell: { words: ["two"] } },
    ])
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

  it("redacts an object spellcheck from a shared options object in the missing-config message", () => {
    // A shared `ConfigOptions` object is accepted by the type; the key is ignored.
    const shared: ConfigOptions = {
      react: true,
      spellcheck: { words: ["SecretWordAlpha"], dictionaries: ["secret-dict-beta"], language: "xx-delta" },
    }
    const { message } = captureError(() => getOxlintConfig(shared))
    expect(message).toContain("No pre-generated OxLint config found")
    expect(message).toContain('"react":true')
    expect(message).toContain('"spellcheck":"<configured>"')
    for (const value of ["SecretWordAlpha", "secret-dict-beta", "xx-delta"]) {
      expect(message).not.toContain(value)
    }
  })
})
