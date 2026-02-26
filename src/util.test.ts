import { describe, expect, it } from "vitest"

import { flags, getConfigObject, numberToShortHash, optionsToNumber } from "./util"

describe("flags", () => {
  it("contains the expected flag names", () => {
    expect(flags).toEqual(["strict", "node", "react", "ai"])
  })
})

describe("optionsToNumber", () => {
  it("returns 0 for empty options", () => {
    expect(optionsToNumber({})).toBe(0)
  })

  it("returns 0 when all flags are false", () => {
    expect(optionsToNumber({ strict: false, node: false, react: false, ai: false })).toBe(0)
  })

  it("maps strict to bit 0", () => {
    expect(optionsToNumber({ strict: true })).toBe(1)
  })

  it("maps node to bit 1", () => {
    expect(optionsToNumber({ node: true })).toBe(2)
  })

  it("maps react to bit 2", () => {
    expect(optionsToNumber({ react: true })).toBe(4)
  })

  it("maps ai to bit 3", () => {
    expect(optionsToNumber({ ai: true })).toBe(8)
  })

  it("combines multiple flags via bitwise OR", () => {
    expect(optionsToNumber({ strict: true, react: true })).toBe(5)
  })

  it("returns 15 when all flags are enabled", () => {
    expect(optionsToNumber({ strict: true, node: true, react: true, ai: true })).toBe(15)
  })
})

describe("numberToShortHash", () => {
  it("returns an 8-character hex string", () => {
    const hash = numberToShortHash(0)
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it("returns consistent results for the same input", () => {
    expect(numberToShortHash(5)).toBe(numberToShortHash(5))
  })

  it("returns different hashes for different inputs", () => {
    expect(numberToShortHash(0)).not.toBe(numberToShortHash(1))
  })
})

describe("getConfigObject", () => {
  const mockConfig = [
    { name: "effective/base", rules: { "no-console": "warn" as const } },
    { name: "effective/test", rules: { "no-console": "off" as const } },
    { name: "effective/e2e", rules: {} },
    { name: "effective/storybook", rules: {} }
  ]

  it("returns the base config by default", () => {
    const result = getConfigObject(mockConfig)
    expect(result).toBe(mockConfig[0])
  })

  it("returns the specified config object", () => {
    expect(getConfigObject(mockConfig, "test")).toBe(mockConfig[1])
    expect(getConfigObject(mockConfig, "e2e")).toBe(mockConfig[2])
    expect(getConfigObject(mockConfig, "storybook")).toBe(mockConfig[3])
  })

  it("throws when the config object is not found", () => {
    expect(() => getConfigObject([], "base")).toThrow("Config base not found!")
  })
})
