import { createHash } from "node:crypto"

import type { ConfigOptions, OxlintConfigOptions } from "./types"

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

// --- OxLint config permutations (3 flags → 8 combos) ---

/** Converts OxLint-relevant options to a 3-bit bitmask (react, node, ai). */
export function oxlintOptionsToBitmask(opts: OxlintConfigOptions): number {
  let mask = 0
  if (opts.react) mask |= 1 << 0
  if (opts.node) mask |= 1 << 1
  if (opts.ai) mask |= 1 << 2
  return mask
}

/** Deterministic hash for OxLint configs (different salt to avoid collisions). */
export function oxlintBitmaskToHash(mask: number): string {
  const input = `eslint-config-setup-oxlint:${mask}`
  return createHash("sha1").update(input).digest("hex").slice(0, 8)
}

/** OxLint options → filename (without path prefix). */
export function oxlintOptionsToFilename(opts: OxlintConfigOptions): string {
  return `${oxlintBitmaskToHash(oxlintOptionsToBitmask(opts))}.json`
}

/** Total number of OxLint permutations (2^3 = 8). */
export const TOTAL_OXLINT_PERMUTATIONS = 8

/** Iterate all OxLint option combinations. */
export function* allOxlintPermutations(): Generator<OxlintConfigOptions> {
  for (let mask = 0; mask < TOTAL_OXLINT_PERMUTATIONS; mask++) {
    yield {
      react: Boolean(mask & (1 << 0)),
      node: Boolean(mask & (1 << 1)),
      ai: Boolean(mask & (1 << 2)),
    }
  }
}
