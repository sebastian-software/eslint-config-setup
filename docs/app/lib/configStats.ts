/**
 * Typed accessor for the build-time config stats consumed by the homepage
 * flag configurator. The JSON is produced by `docs/scripts/generate-config-stats.ts`
 * from the package's own composition logic — hashes and counts are baked in,
 * so no crypto or rule resolution runs in the browser.
 */
import statsJson from "../generated/config-stats.json"

export type FlagState = {
  ai: boolean
  node: boolean
  oxlint: boolean
  react: boolean
}

export type OxlintSplit = {
  eslintRemaining: number
  filename: string
  handledRules: number
}

export type PermutationStats = {
  activeRules: number
  bitmask: number
  filename: string
  flags: FlagState
  hash: string
  moduleKb: number
  oxlint: null | OxlintSplit
}

const data: { permutations: PermutationStats[] } = statsJson

/** Mirrors the package's bit order (react, node, ai, oxlint) — must never change. */
export function flagsToBitmask(flags: FlagState): number {
  let mask = 0
  if (flags.react) mask |= 1 << 0
  if (flags.node) mask |= 1 << 1
  if (flags.ai) mask |= 1 << 2
  if (flags.oxlint) mask |= 1 << 3
  return mask
}

const byBitmask = new Map<number, PermutationStats>(
  data.permutations.map((permutation) => [permutation.bitmask, permutation]),
)

export function getPermutation(flags: FlagState): PermutationStats {
  const stats = byBitmask.get(flagsToBitmask(flags))
  if (!stats) {
    throw new Error("config-stats.json is missing a permutation — regenerate it")
  }
  return stats
}
