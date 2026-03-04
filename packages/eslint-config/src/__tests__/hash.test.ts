import { describe, expect, it } from "vitest"

import {
  allOxlintPermutations,
  allPermutations,
  bitmaskToHash,
  optionsToBitmask,
  optionsToFilename,
  oxlintBitmaskToHash,
  oxlintOptionsToBitmask,
  oxlintOptionsToFilename,
  TOTAL_OXLINT_PERMUTATIONS,
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
    expect(hash).toMatch(/^[\da-f]{8}$/)
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
    expect(filename).toMatch(/^[\da-f]{8}\.js$/)
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
    expect(first).toStrictEqual({
      react: false,
      node: false,
      ai: false,
      oxlint: false,
    })
  })

  it("last permutation is all-true", () => {
    const perms = [...allPermutations()]
    expect(perms[15]).toStrictEqual({
      react: true,
      node: true,
      ai: true,
      oxlint: true,
    })
  })
})

// --- OxLint hash functions ---

describe("oxlintOptionsToBitmask", () => {
  it("returns 0 for empty options", () => {
    expect(oxlintOptionsToBitmask({})).toBe(0)
  })

  it("maps react to bit 0", () => {
    expect(oxlintOptionsToBitmask({ react: true })).toBe(1)
  })

  it("maps node to bit 1", () => {
    expect(oxlintOptionsToBitmask({ node: true })).toBe(2)
  })

  it("maps ai to bit 2", () => {
    expect(oxlintOptionsToBitmask({ ai: true })).toBe(4)
  })

  it("combines all flags correctly", () => {
    expect(
      oxlintOptionsToBitmask({ react: true, node: true, ai: true }),
    ).toBe(7)
  })
})

describe("oxlintBitmaskToHash", () => {
  it("returns a deterministic 8-char hex string", () => {
    const hash = oxlintBitmaskToHash(0)
    expect(hash).toMatch(/^[\da-f]{8}$/)
  })

  it("uses a different salt than ESLint hashes", () => {
    expect(oxlintBitmaskToHash(0)).not.toBe(bitmaskToHash(0))
  })

  it("returns different hashes for different inputs", () => {
    const hashes = new Set<string>()
    for (let i = 0; i < TOTAL_OXLINT_PERMUTATIONS; i++) {
      hashes.add(oxlintBitmaskToHash(i))
    }
    expect(hashes.size).toBe(TOTAL_OXLINT_PERMUTATIONS)
  })
})

describe("oxlintOptionsToFilename", () => {
  it("returns a .json filename", () => {
    const filename = oxlintOptionsToFilename({ react: true })
    expect(filename).toMatch(/^[\da-f]{8}\.json$/)
  })

  it("is deterministic", () => {
    const a = oxlintOptionsToFilename({ react: true, ai: true })
    const b = oxlintOptionsToFilename({ react: true, ai: true })
    expect(a).toBe(b)
  })
})

describe("allOxlintPermutations", () => {
  it("yields exactly 8 permutations", () => {
    const perms = [...allOxlintPermutations()]
    expect(perms).toHaveLength(8)
  })

  it("first permutation is all-false", () => {
    const [first] = allOxlintPermutations()
    expect(first).toStrictEqual({
      react: false,
      node: false,
      ai: false,
    })
  })

  it("last permutation is all-true", () => {
    const perms = [...allOxlintPermutations()]
    expect(perms[7]).toStrictEqual({
      react: true,
      node: true,
      ai: true,
    })
  })

  it("does not include oxlint flag", () => {
    const perms = [...allOxlintPermutations()]
    for (const perm of perms) {
      expect(perm).not.toHaveProperty("oxlint")
    }
  })
})
