import { createHash } from "node:crypto"

import type { ConfigOptions } from "./types.ts"

/**
 * Converts config options to a deterministic bitmask.
 * Bit order is fixed and must never change (would break published configs).
 */
export function optionsToBitmask(opts: ConfigOptions): number {
  let mask = 0
  if (opts.react) mask |= 1 << 0
  if (opts.node) mask |= 1 << 1
  if (opts.ai) mask |= 1 << 2
  if (opts.oxlint) mask |= 1 << 3
  return mask
}

/**
 * Converts a bitmask to a short deterministic hash (8 hex chars).
 * The same hash is produced at build-time (generate) and run-time (getConfig).
 */
export function bitmaskToHash(mask: number): string {
  const input = `effective-eslint-config:${mask}`
  return createHash("sha1").update(input).digest("hex").slice(0, 8)
}

/** Convenience: options → filename (without path prefix). */
export function optionsToFilename(opts: ConfigOptions): string {
  return `${bitmaskToHash(optionsToBitmask(opts))}.js`
}

/** Total number of permutations (2^4 = 16). */
export const TOTAL_PERMUTATIONS = 16

/** Iterate all possible option combinations. */
export function* allPermutations(): Generator<ConfigOptions> {
  for (let mask = 0; mask < TOTAL_PERMUTATIONS; mask++) {
    yield {
      react: Boolean(mask & (1 << 0)),
      node: Boolean(mask & (1 << 1)),
      ai: Boolean(mask & (1 << 2)),
      oxlint: Boolean(mask & (1 << 3)),
    }
  }
}
