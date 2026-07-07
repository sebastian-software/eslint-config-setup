/**
 * Build-time data source for the homepage flag configurator.
 *
 * Imports the exact composition and codegen logic that produces the published
 * configs (from `packages/eslint-config/src`, not from `dist`), computes the
 * effective rule stats for all 16 flag permutations, and writes them to
 * `docs/app/generated/config-stats.json`.
 *
 * The JSON is committed and regenerated on every docs build, so any drift
 * between package source and homepage numbers shows up in the PR diff.
 * No timestamps are emitted — the output must be byte-stable for identical
 * package sources (prerender/hydration determinism).
 *
 * Run via: pnpm --filter docs data  (tsx scripts/generate-config-stats.ts)
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

// Some plugins in the composition graph expect a CJS `require` at import time
// (same shim the package's own generate script uses).
;(globalThis as Record<string, unknown>).require = createRequire(import.meta.url)

const { generateConfigModule } = await import(
  "../../packages/eslint-config/src/build/codegen"
)
const { composeConfig } = await import("../../packages/eslint-config/src/build/compose")
const {
  allPermutations,
  bitmaskToHash,
  optionsToBitmask,
  oxlintBitmaskToHash,
  oxlintOptionsToBitmask,
} = await import("../../packages/eslint-config/src/hash")

type FlatConfigArray = ReturnType<typeof composeConfig>

interface PermutationStats {
  activeRules: number
  bitmask: number
  filename: string
  flags: { ai: boolean; node: boolean; oxlint: boolean; react: boolean }
  hash: string
  moduleKb: number
  oxlint: null | {
    eslintRemaining: number
    filename: string
    handledRules: number
  }
}

function isActive(value: unknown): boolean {
  const severity: unknown = Array.isArray(value) ? (value as unknown[])[0] : value
  return severity !== "off" && severity !== 0
}

/**
 * Unique rule names that are enabled by at least one block of the composed
 * config — the ruleset the package curates for this permutation, across all
 * file-type overrides.
 */
function unionActiveNames(config: FlatConfigArray): Set<string> {
  const names = new Set<string>()
  for (const block of config) {
    if (!block.rules) continue
    for (const [name, value] of Object.entries(block.rules)) {
      if (isActive(value)) names.add(name)
    }
  }
  return names
}

/**
 * Rule names the OxLint integration blocks disable — these rules run in Rust
 * via `oxlint` instead of in ESLint.
 */
function oxlintHandledNames(config: FlatConfigArray): Set<string> {
  const names = new Set<string>()
  for (const block of config) {
    if (typeof block.name !== "string" || !block.name.includes("oxlint")) continue
    if (!block.rules) continue
    for (const [name, value] of Object.entries(block.rules)) {
      if (!isActive(value)) names.add(name)
    }
  }
  return names
}

function buildStats(): PermutationStats[] {
  const permutations: PermutationStats[] = []

  for (const opts of allPermutations()) {
    const flags = {
      react: opts.react === true,
      node: opts.node === true,
      ai: opts.ai === true,
      oxlint: opts.oxlint === true,
    }
    const bitmask = optionsToBitmask(flags)
    const hash = bitmaskToHash(bitmask)
    const moduleSource = generateConfigModule(flags)

    const config = composeConfig(flags)
    const active = unionActiveNames(config)
    const activeRules = active.size

    let oxlint: PermutationStats["oxlint"] = null

    if (flags.oxlint) {
      const handledSet = oxlintHandledNames(config)
      const handledRules = [...active].filter((name) => handledSet.has(name)).length
      oxlint = {
        handledRules,
        eslintRemaining: activeRules - handledRules,
        filename: `${oxlintBitmaskToHash(oxlintOptionsToBitmask(flags))}.json`,
      }
    }

    permutations.push({
      flags,
      bitmask,
      hash,
      filename: `${hash}.js`,
      activeRules,
      moduleKb: Math.round((Buffer.byteLength(moduleSource) / 1024) * 10) / 10,
      oxlint,
    })
  }

  return permutations
}

const stats = buildStats()
const outDir = path.resolve(import.meta.dirname, "../app/generated")
mkdirSync(outDir, { recursive: true })

const outFile = path.join(outDir, "config-stats.json")
writeFileSync(outFile, `${JSON.stringify({ permutations: stats }, null, 2)}\n`, "utf8")

console.log(`Wrote ${stats.length} permutations to ${path.relative(process.cwd(), outFile)}`)
for (const p of stats) {
  const desc =
    Object.entries(p.flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(" + ") || "base"
  const split = p.oxlint
    ? ` (oxlint ${p.oxlint.handledRules} / eslint ${p.oxlint.eslintRemaining})`
    : ""
  console.log(`  [${String(p.bitmask).padStart(2, " ")}] ${p.filename} ${desc}: ${p.activeRules} rules${split}`)
}
