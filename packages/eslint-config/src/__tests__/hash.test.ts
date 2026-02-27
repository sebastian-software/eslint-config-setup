import { describe, expect, it } from "vitest"

import {
  allPermutations,
  bitmaskToHash,
  optionsToBitmask,
  optionsToFilename,
  TOTAL_PERMUTATIONS,
} from "../hash"

describe("optionsToBitmask", () => {
  it("returns 0 for empty options", () => {
    expect(optionsToBitmask({})).toBe(0)
  })

  it("returns 0 for all-false options", () => {
    expect(
      optionsToBitmask({
        react: false,
        node: false,
        ai: false,
        oxlint: false,
      }),
    ).toBe(0)
  })

  it("maps react to bit 0", () => {
    expect(optionsToBitmask({ react: true })).toBe(1)
  })

  it("maps node to bit 1", () => {
    expect(optionsToBitmask({ node: true })).toBe(2)
  })

  it("maps ai to bit 2", () => {
    expect(optionsToBitmask({ ai: true })).toBe(4)
  })

  it("maps oxlint to bit 3", () => {
    expect(optionsToBitmask({ oxlint: true })).toBe(8)
  })

  it("combines all flags correctly", () => {
    expect(
      optionsToBitmask({
        react: true,
        node: true,
        ai: true,
        oxlint: true,
      }),
    ).toBe(15)
  })
})

describe("bitmaskToHash", () => {
  it("returns a deterministic 8-char hex string", () => {
    const hash = bitmaskToHash(0)
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it("returns the same hash for the same input", () => {
    expect(bitmaskToHash(5)).toBe(bitmaskToHash(5))
  })

  it("returns different hashes for different inputs", () => {
    const hashes = new Set<string>()
    for (let i = 0; i < TOTAL_PERMUTATIONS; i++) {
      hashes.add(bitmaskToHash(i))
    }
    expect(hashes.size).toBe(TOTAL_PERMUTATIONS)
  })
})

describe("optionsToFilename", () => {
  it("returns a .js filename", () => {
    const filename = optionsToFilename({ react: true })
    expect(filename).toMatch(/^[0-9a-f]{8}\.js$/)
  })

  it("is deterministic", () => {
    const a = optionsToFilename({ react: true, ai: true })
    const b = optionsToFilename({ react: true, ai: true })
    expect(a).toBe(b)
  })
})

describe("allPermutations", () => {
  it("yields exactly 16 permutations", () => {
    const perms = [...allPermutations()]
    expect(perms).toHaveLength(16)
  })

  it("first permutation is all-false", () => {
    const [first] = allPermutations()
    expect(first).toEqual({
      react: false,
      node: false,
      ai: false,
      oxlint: false,
    })
  })

  it("last permutation is all-true", () => {
    const perms = [...allPermutations()]
    expect(perms[15]).toEqual({
      react: true,
      node: true,
      ai: true,
      oxlint: true,
    })
  })
})
