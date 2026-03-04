import { describe, expect, it } from "vitest"

import { serializeOxlintConfig } from "../build/serialize"

describe("serializeOxlintConfig", () => {
  it("serializes an object to indented JSON with trailing newline", () => {
    const result = serializeOxlintConfig({ rules: { "no-eval": "error" } })
    expect(result).toBe('{\n  "rules": {\n    "no-eval": "error"\n  }\n}\n')
  })

  it("serializes an empty object", () => {
    const result = serializeOxlintConfig({})
    expect(result).toBe("{}\n")
  })

  it("serializes arrays", () => {
    const result = serializeOxlintConfig({ plugins: ["react", "unicorn"] })
    expect(result).toContain('"react"')
    expect(result).toContain('"unicorn"')
    expect(result.endsWith("\n")).toBe(true)
  })

  it("serializes null and boolean values", () => {
    const result = serializeOxlintConfig({ enabled: true, disabled: null })
    expect(result).toContain('"enabled": true')
    expect(result).toContain('"disabled": null')
  })
})
