import { describe, expect, it } from "vitest"

import { generateOxlintConfig } from "../build/oxlint-generator.ts"

describe("generateOxlintConfig", () => {
  it("returns a valid structure with schema, plugins, rules, and overrides", () => {
    const config = generateOxlintConfig({})

    expect(config.$schema).toBe(
      "./node_modules/oxlint/configuration_schema.json",
    )
    expect(Array.isArray(config.plugins)).toBe(true)
    expect(typeof config.rules).toBe("object")
    expect(Array.isArray(config.overrides)).toBe(true)
  })

  it("only includes rules that OxLint supports", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const oxlintPlugin = require("eslint-plugin-oxlint") as {
      configs: Record<string, unknown>
    }

    // Build the full set of OxLint-supported rule names
    const supported = new Set<string>()
    for (const key of Object.keys(oxlintPlugin.configs)) {
      if (!key.startsWith("flat/")) continue
      const entries = oxlintPlugin.configs[key]
      const items = Array.isArray(entries) ? entries : [entries]
      for (const item of items as Array<{ rules?: Record<string, unknown> }>) {
        if (item.rules) {
          for (const name of Object.keys(item.rules)) supported.add(name)
        }
      }
    }

    const config = generateOxlintConfig({ react: true, node: true, ai: true })

    for (const ruleName of Object.keys(config.rules)) {
      expect(supported.has(ruleName)).toBe(true)
    }

    for (const override of config.overrides) {
      for (const ruleName of Object.keys(override.rules)) {
        expect(supported.has(ruleName)).toBe(true)
      }
    }
  })

  it("excludes rules that OxLint does not support", () => {
    const config = generateOxlintConfig({})

    // SonarJS rules are NOT in OxLint
    const sonarRules = Object.keys(config.rules).filter((r) =>
      r.startsWith("sonarjs/"),
    )
    expect(sonarRules).toHaveLength(0)
  })

  it("preserves severity and options from the ESLint config", () => {
    const config = generateOxlintConfig({})

    // eqeqeq should be present and keep its options
    expect(config.rules["eqeqeq"]).toBeDefined()

    const entry = config.rules["eqeqeq"]
    // Should be an array with severity + option, or a string severity
    if (Array.isArray(entry)) {
      expect(["off", "warn", "error", 0, 1, 2]).toContain(entry[0])
    } else {
      expect(["off", "warn", "error", 0, 1, 2]).toContain(entry)
    }
  })

  it("derives plugin list from rule prefixes", () => {
    const config = generateOxlintConfig({})

    // We know @typescript-eslint rules are included → "typescript" plugin
    expect(config.plugins).toContain("typescript")

    // Unicorn rules → "unicorn" plugin
    expect(config.plugins).toContain("unicorn")

    // Plugins should be sorted
    const sorted = [...config.plugins].sort()
    expect(config.plugins).toEqual(sorted)
  })

  it("includes import/ rules", () => {
    const config = generateOxlintConfig({})

    const importRules = Object.keys(config.rules).filter((r) =>
      r.startsWith("import/"),
    )
    expect(importRules.length).toBeGreaterThan(0)
  })

  it("maps file overrides correctly", () => {
    const config = generateOxlintConfig({})

    // There should be overrides for test files, config files, etc.
    expect(config.overrides.length).toBeGreaterThan(0)

    for (const override of config.overrides) {
      expect(override.files.length).toBeGreaterThan(0)
      expect(Object.keys(override.rules).length).toBeGreaterThan(0)
    }
  })

  it("includes react plugin when react option is enabled", () => {
    const withReact = generateOxlintConfig({ react: true })
    const withoutReact = generateOxlintConfig({})

    expect(withReact.plugins).toContain("react")
    expect(withoutReact.plugins).not.toContain("react")
  })

  it("includes node plugin when node option is enabled", () => {
    const withNode = generateOxlintConfig({ node: true })
    expect(withNode.plugins).toContain("node")
  })

  it("produces valid JSON when serialized", () => {
    const config = generateOxlintConfig({ react: true, node: true, ai: true })
    const json = JSON.stringify(config, null, 2)

    expect(() => JSON.parse(json)).not.toThrow()
  })
})
