import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { execaCommand } from "execa"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

const PACKAGE_ROOT = join(import.meta.dirname, "../..")

/** Path to the built modules export of the package */
const MODULES_PATH = join(PACKAGE_ROOT, "dist/modules.js")

/** ESLint config that imports cspell from our built package and enables .ts files */
function makeEslintConfig(): string {
  // Use dynamic import with the absolute path to the built package.
  // We need { files: ["**/*.ts"] } to tell ESLint to lint TypeScript files,
  // since flat config does not include them by default.
  return `
    const { cspell } = await import(${JSON.stringify(MODULES_PATH)})
    export default [
      { files: ["**/*.ts"] },
      ...cspell()
    ]
  `
}

/** A TypeScript file that uses a custom (unknown) word as an identifier */
function makeSourceFile(): string {
  return `const terminaro = 1\nexport { terminaro }\n`
}

/** cspell.json that whitelists our custom word */
function makeCspellJson(): string {
  return JSON.stringify({ words: ["terminaro"] })
}

/** Run ESLint in the given directory and return the result */
async function runEslint(cwd: string) {
  const eslintBin = join(PACKAGE_ROOT, "node_modules/.bin/eslint")
  return execaCommand(`${eslintBin} .`, {
    cwd,
    reject: false,
    env: { NO_COLOR: "1" },
  })
}

function hasCspellWarning(output: string): boolean {
  return output.includes("@cspell/spellchecker")
}

describe("cspell.json config file discovery", { timeout: 30_000 }, () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "cspell-test-"))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("baseline — unknown word is flagged without cspell.json", async () => {
    writeFileSync(join(tempDir, "eslint.config.mjs"), makeEslintConfig())
    writeFileSync(join(tempDir, "index.ts"), makeSourceFile())

    const result = await runEslint(tempDir)

    expect(hasCspellWarning(result.stdout)).toBe(true)
  })

  it("simple repo — cspell.json in root suppresses warning", async () => {
    writeFileSync(join(tempDir, "eslint.config.mjs"), makeEslintConfig())
    writeFileSync(join(tempDir, "index.ts"), makeSourceFile())
    writeFileSync(join(tempDir, "cspell.json"), makeCspellJson())

    const result = await runEslint(tempDir)

    expect(hasCspellWarning(result.stdout)).toBe(false)
  })

  it("monorepo — cspell.json in workspace root, file in nested package", async () => {
    writeFileSync(join(tempDir, "eslint.config.mjs"), makeEslintConfig())
    writeFileSync(join(tempDir, "cspell.json"), makeCspellJson())

    const pkgDir = join(tempDir, "packages/app/src")
    mkdirSync(pkgDir, { recursive: true })
    writeFileSync(join(pkgDir, "index.ts"), makeSourceFile())

    const result = await runEslint(tempDir)

    expect(hasCspellWarning(result.stdout)).toBe(false)
  })

  it("nested config — cspell.json in subpackage only", async () => {
    writeFileSync(join(tempDir, "eslint.config.mjs"), makeEslintConfig())

    const pkgDir = join(tempDir, "packages/app")
    const srcDir = join(pkgDir, "src")
    mkdirSync(srcDir, { recursive: true })
    writeFileSync(join(pkgDir, "cspell.json"), makeCspellJson())
    writeFileSync(join(srcDir, "index.ts"), makeSourceFile())

    const result = await runEslint(tempDir)

    // Determine if cspell walks up from the file location to find config
    // If it does, this should pass (no warning). If not, it will warn.
    expect(hasCspellWarning(result.stdout)).toBe(false)
  })
})
