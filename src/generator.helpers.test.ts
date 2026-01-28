import { describe, expect, it } from "vitest"

import { configToModule, ruleSorter } from "./generator"

describe("ruleSorter", () => {
  it("sorts core rules before plugin rules", () => {
    expect(ruleSorter("no-console", "react/jsx-key")).toBe(-1)
  })

  it("sorts plugin rules after core rules", () => {
    expect(ruleSorter("react/jsx-key", "no-console")).toBe(1)
  })

  it("sorts core rules alphabetically", () => {
    expect(ruleSorter("no-console", "no-debugger")).toBeLessThan(0)
    expect(ruleSorter("no-debugger", "no-console")).toBeGreaterThan(0)
  })

  it("sorts plugin rules alphabetically", () => {
    expect(ruleSorter("react/jsx-key", "react/no-children-prop")).toBeLessThan(0)
  })

  it("returns 0 for identical rules", () => {
    expect(ruleSorter("no-console", "no-console")).toBe(0)
  })

  it("sorts cross-plugin rules alphabetically", () => {
    expect(ruleSorter("@typescript-eslint/no-unused-vars", "react/jsx-key")).toBeLessThan(0)
  })
})

describe("configToModule", () => {
  it("produces a valid ES module string", async () => {
    const config = [{ rules: { "no-console": "warn" } }]
    const result = await configToModule(config)
    expect(result).toContain("export default")
    expect(result).toContain("no-console")
  })

  it("replaces triple-bracket placeholders with require statements", async () => {
    const config = [
      {
        plugins: { react: "[[[eslint-plugin-react]]]" },
        rules: { "no-console": "warn" }
      }
    ]
    const result = await configToModule(config)
    expect(result).toContain('require("eslint-plugin-react")')
    expect(result).not.toContain("[[[")
  })

  it("includes createRequire for ESM compatibility", async () => {
    const result = await configToModule([{}])
    expect(result).toContain("createRequire")
    expect(result).toContain("import.meta.url")
  })

  it("handles parser placeholder", async () => {
    const config = [
      {
        languageOptions: { parser: "[[[@typescript-eslint/parser]]]" }
      }
    ]
    const result = await configToModule(config)
    expect(result).toContain('require("@typescript-eslint/parser")')
  })
})
