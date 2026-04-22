/* eslint-disable max-statements, security/detect-non-literal-fs-filename -- Build script: sequential file generation steps. All fs paths are computed from deterministic hashes, not user input. */
import { mkdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

import type { ConfigOptions, OxlintConfigOptions } from "../types"

import {
  allOxlintPermutations,
  allPermutations,
  bitmaskToHash,
  optionsToBitmask,
  oxlintBitmaskToHash,
  oxlintOptionsToBitmask,
} from "../hash"
import { generateConfigModule } from "./codegen"
import { composeConfig } from "./compose"
import { serializeOxlintConfig } from "./serialize"

;(globalThis as Record<string, unknown>).require = createRequire(import.meta.url) // eslint-disable-line import/newline-after-import -- Semicolon-prefixed statement confuses the rule

const dirname = import.meta.dirname
const outDir = path.resolve(dirname, "../../dist/configs")
const oxlintOutDir = path.resolve(dirname, "../../dist/oxlint-configs")

function describeOptions(opts: ConfigOptions | OxlintConfigOptions): string {
  const flags = Object.entries(opts)
    .filter(([, v]) => v)
    .map(([k]) => k)
  return flags.length > 0 ? flags.join(" + ") : "base"
}

async function main(): Promise<void> {
  // --- ESLint configs (16 permutations) ---
  mkdirSync(outDir, { recursive: true })

  let eslintCount = 0

  for (const opts of allPermutations()) {
    const mask = optionsToBitmask(opts)
    const hash = bitmaskToHash(mask)
    const filename = `${hash}.js`
    const filepath = path.join(outDir, filename)

    const content = generateConfigModule(opts)

    writeFileSync(filepath, content, "utf8")
    eslintCount++

    const desc = describeOptions(opts)
    const size = (Buffer.byteLength(content) / 1024).toFixed(1)
    console.log(`  [${String(mask).padStart(2, " ")}] ${hash}.js → ${desc} (${size} KB)`)
  }

  console.log(`\nGenerated ${eslintCount} ESLint config permutations in dist/configs/`)

  // --- OxLint configs (8 permutations) ---
  const migrateModule = await import("@oxlint/migrate")
  const migrate = migrateModule.default

  mkdirSync(oxlintOutDir, { recursive: true })

  let oxlintCount = 0

  for (const opts of allOxlintPermutations()) {
    const mask = oxlintOptionsToBitmask(opts)
    const hash = oxlintBitmaskToHash(mask)
    const filename = `${hash}.json`
    const filepath = path.join(oxlintOutDir, filename)

    // Compose ESLint config WITHOUT oxlint flag (we want all rules enabled)
    const eslintConfig = composeConfig({ ...opts, oxlint: false })
    const oxlintConfig = await migrate(eslintConfig)
    const content = serializeOxlintConfig(oxlintConfig)

    writeFileSync(filepath, content, "utf8")
    oxlintCount++

    const desc = describeOptions(opts)
    const size = (Buffer.byteLength(content) / 1024).toFixed(1)
    console.log(`  [${String(mask).padStart(2, " ")}] ${hash}.json → ${desc} (${size} KB)`)
  }

  console.log(`\nGenerated ${oxlintCount} OxLint config permutations in dist/oxlint-configs/`)
}

await main()
