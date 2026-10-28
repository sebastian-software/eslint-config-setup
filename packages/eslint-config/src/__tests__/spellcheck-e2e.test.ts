/* eslint-disable security/detect-non-literal-fs-filename */
import { ESLint, type Linter } from "eslint"
import { randomUUID } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import type { FlatConfigArray, SpellcheckOptions } from "../types"

import { applySpellcheckOptions } from "../api/spellcheck"
import { loadGeneratedConfig, makeTempDir, removeTempDirs } from "./helpers/generated-config"

const RULE = "@cspell/spellchecker"
/** Extensions cspell accepts for `cspell.config.*` files. */
const CSPELL_CONFIG_EXTENSIONS = [
  ".json", ".jsonc", ".yaml", ".yml", ".mjs", ".cjs", ".js", ".toml", ".mts", ".ts", ".cts",
]

/**
 * Config file names cspell searches in every directory, mirroring the search
 * places of cspell-lib 10 (`configLocations.js`). `package.json` is checked
 * separately because it only counts when it has a `cspell` field.
 */
const CSPELL_CONFIG_NAMES = [
  ".cspell.json",
  "cspell.json",
  ".cSpell.json",
  "cSpell.json",
  ".cspell.jsonc",
  "cspell.jsonc",
  ".vscode/cspell.json",
  ".vscode/cSpell.json",
  ".vscode/.cspell.json",
  ...CSPELL_CONFIG_EXTENSIONS.map((ext) => `cspell.config${ext}`),
  ...CSPELL_CONFIG_EXTENSIONS.map((ext) => `.cspell.config${ext}`),
  ".cspell.yaml",
  ".cspell.yml",
  "cspell.yaml",
  "cspell.yml",
  ".config/.cspell.json",
  ".config/cspell.json",
  ".config/.cSpell.json",
  ".config/cSpell.json",
  ".config/.cspell.jsonc",
  ".config/cspell.jsonc",
  ...CSPELL_CONFIG_EXTENSIONS.map((ext) => `.config/cspell.config${ext}`),
  ...CSPELL_CONFIG_EXTENSIONS.map((ext) => `.config/.cspell.config${ext}`),
  ".config/cspell.yaml",
  ".config/cspell.yml",
]

let loaded: FlatConfigArray

beforeAll(async () => {
  const { config } = await loadGeneratedConfig({})
  loaded = config
}, 60_000)

afterAll(() => {
  removeTempDirs()
})

function hasCspellField(packageJsonPath: string): boolean {
  if (!existsSync(packageJsonPath)) return false
  try {
    const pkg: unknown = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    return typeof pkg === "object" && pkg !== null && "cspell" in pkg
  } catch {
    return false
  }
}

function assertNoCspellConfig(dir: string): void {
  let current = dir
  for (;;) {
    for (const name of CSPELL_CONFIG_NAMES) {
      expect(existsSync(path.join(current, name)), `unexpected ${name} in ${current}`).toBe(false)
    }
    const packageJson = path.join(current, "package.json")
    expect(hasCspellField(packageJson), `unexpected "cspell" field in ${packageJson}`).toBe(false)
    const parent = path.dirname(current)
    if (parent === current) return
    current = parent
  }
}

function makeFixtureDir(file: string, source: string): string {
  const dir = makeTempDir("spellcheck-e2e")
  writeFileSync(path.join(dir, file), source)
  writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { strict: true }, include: ["*.ts"] }),
  )
  return dir
}

async function lintAll(
  dir: string,
  files: string[],
  spellcheck: boolean | SpellcheckOptions | undefined,
): Promise<ESLint.LintResult[]> {
  const overrideConfig: Linter.Config[] = [
    ...applySpellcheckOptions(loaded, spellcheck),
    { languageOptions: { parserOptions: { tsconfigRootDir: dir } } },
  ]
  const eslint = new ESLint({ cwd: dir, overrideConfigFile: true, overrideConfig })
  return eslint.lintFiles(files.map((file) => path.join(dir, file)))
}

async function lint(dir: string, file: string, spellcheck: boolean | SpellcheckOptions | undefined) {
  const [result] = await lintAll(dir, [file], spellcheck)
  return result
}

function spellMessages(result: ESLint.LintResult): string[] {
  return result.messages.filter((m) => m.ruleId === RULE).map((m) => m.message)
}

const TIMEOUT = 120_000

describe("spellcheck option E2E", () => {
  const word = "Kundennummer"
  const source = `// Die ${word} is checked\nexport const value = 1\n`
  let dir: string

  beforeAll(() => {
    dir = makeFixtureDir("test.ts", source)
    assertNoCspellConfig(dir)
  })

  it("reports the German comment word by default", { timeout: TIMEOUT }, async () => {
    const result = await lint(dir, "test.ts", undefined)
    expect(result.messages.filter((m) => m.fatal)).toHaveLength(0)
    expect(spellMessages(result).some((m) => m.includes(word))).toBe(true)
  })

  it("does not report it with spellcheck: false", { timeout: TIMEOUT }, async () => {
    const result = await lint(dir, "test.ts", false)
    expect(result.messages.filter((m) => m.fatal)).toHaveLength(0)
    expect(spellMessages(result)).toHaveLength(0)
  })

  it("does not report it with the word in spellcheck.words", { timeout: TIMEOUT }, async () => {
    const result = await lint(dir, "test.ts", { words: [word] })
    expect(spellMessages(result).some((m) => m.includes(word))).toBe(false)
    expect(result.messages.filter((m) => m.severity === 2 && m.ruleId === RULE)).toHaveLength(0)
  })

  it("lints an eslint-disable directive for the rule without errors when disabled", { timeout: TIMEOUT }, async () => {
    const disableDir = makeFixtureDir(
      "test.ts",
      `// eslint-disable-next-line @cspell/spellchecker\n// ${word}\nexport const value = 1\n`,
    )
    assertNoCspellConfig(disableDir)
    const result = await lint(disableDir, "test.ts", false)
    expect(result.errorCount).toBe(0)
    expect(result.messages.some((m) => m.message.includes("Definition for rule"))).toBe(false)
    expect(result.messages.some((m) => m.message.includes("not found"))).toBe(false)
  })

  it("merges a project cspell.json with inline words", { timeout: TIMEOUT }, async () => {
    const wordA = "Flurbinator"
    const wordB = "Wibblesnort"
    const comment = `// ${wordA} and ${wordB}\nexport const value = 1\n`

    // Baseline in a separate dir (cspell caches config lookups per directory).
    const baselineDir = makeFixtureDir("test.ts", comment)
    assertNoCspellConfig(baselineDir)
    const baselineText = spellMessages(await lint(baselineDir, "test.ts", undefined)).join("\n")
    expect(baselineText).toContain(wordA)
    expect(baselineText).toContain(wordB)

    const mergeDir = makeFixtureDir("test.ts", comment)
    writeFileSync(
      path.join(mergeDir, "cspell.json"),
      JSON.stringify({ language: "en", words: [wordA] }),
    )
    const result = await lint(mergeDir, "test.ts", { words: [wordB] })
    const text = spellMessages(result).join("\n")
    expect(text).not.toContain(wordA)
    expect(text).not.toContain(wordB)
  })

  it("records the behaviour for a missing import package", { timeout: TIMEOUT }, async () => {
    // Unique per run, so process-level caching in cspell cannot suppress messages.
    const missingImport = `@cspell/dict-does-not-exist-${randomUUID()}/cspell-ext.json`
    const importDir = makeFixtureDir("first.ts", source)
    writeFileSync(path.join(importDir, "second.ts"), source)
    assertNoCspellConfig(importDir)

    const results = await lintAll(importDir, ["first.ts", "second.ts"], { import: [missingImport] })
    expect(results).toHaveLength(2)
    const perFile = results.map((result) => result.messages.filter((m) => m.ruleId === RULE))

    for (const [index, result] of results.entries()) {
      expect(result.errorCount).toBe(0)
      const messages = perFile[index]
      expect(messages.every((m) => m.severity === 1)).toBe(true)
      expect(
        messages.some((m) =>
          m.message.startsWith(`Failed to resolve configuration file: "${missingImport}"`),
        ),
      ).toBe(true)
      // Normal words are still checked.
      expect(messages.some((m) => m.message.includes(word))).toBe(true)
    }
    // cspell reports the "Configuration Error" only once per process (on the first file), not per file.
    expect(perFile.flat().some((m) => m.message.startsWith("Configuration Error:"))).toBe(true)
  })

  it("silently ignores an unknown dictionary name", { timeout: TIMEOUT }, async () => {
    const withDictionary = await lint(dir, "test.ts", { dictionaries: ["no-such-dictionary"] })
    const byDefault = await lint(dir, "test.ts", undefined)
    expect(withDictionary.errorCount).toBe(0)
    expect(spellMessages(withDictionary)).toStrictEqual(spellMessages(byDefault))
    expect(spellMessages(withDictionary).some((m) => m.includes(word))).toBe(true)
    expect(spellMessages(withDictionary).some((m) => m.includes("no-such-dictionary"))).toBe(false)
  })
})
