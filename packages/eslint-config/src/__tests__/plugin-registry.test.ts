import { describe, expect, it } from "vitest"

import { pluginRegistry, standaloneImports } from "../build/plugin-registry"

describe("pluginRegistry", () => {
  it("has entries for all major plugin namespaces", () => {
    const expected = [
      "@typescript-eslint",
      "import",
      "unused-imports",
      "unicorn",
      "sonarjs",
      "regexp",
      "jsdoc",
      "perfectionist",
      "@cspell",
      "security",
      "de-morgan",
      "compat",
      "node",
      "react",
      "react-hooks",
      "react-refresh",
      "jsx-a11y",
      "vitest",
      "testing-library",
      "playwright",
      "storybook",
      "json",
    ]

    for (const ns of expected) {
      expect(pluginRegistry).toHaveProperty(ns)
    }
  })

  it("every entry has required fields", () => {
    for (const [ns, entry] of Object.entries(pluginRegistry)) {
      expect(entry.pkg, `${ns}.pkg`).toBeTruthy()
      expect(entry.varName, `${ns}.varName`).toBeTruthy()
      expect(entry.importStatement, `${ns}.importStatement`).toContain("import ")
      expect(entry.pluginExpr, `${ns}.pluginExpr`).toBeTruthy()
    }
  })

  it("import statements reference the correct package", () => {
    for (const [ns, entry] of Object.entries(pluginRegistry)) {
      expect(entry.importStatement, `${ns} import should reference package`).toContain(
        `"${entry.pkg}"`,
      )
    }
  })

  it("import statements use the declared varName", () => {
    for (const [ns, entry] of Object.entries(pluginRegistry)) {
      expect(entry.importStatement, `${ns} import should use varName`).toContain(entry.varName)
    }
  })

  it("has no duplicate varNames", () => {
    const varNames = Object.values(pluginRegistry).map((e) => e.varName)
    expect(new Set(varNames).size).toBe(varNames.length)
  })
})

describe("standaloneImports", () => {
  it("has tseslint import", () => {
    expect(standaloneImports.tseslint).toContain("typescript-eslint")
  })

  it("has mdx plugin import", () => {
    expect(standaloneImports.mdxPlugin).toContain("eslint-plugin-mdx")
  })

  it("has package-json plugin import", () => {
    expect(standaloneImports.packageJsonPlugin).toContain("eslint-plugin-package-json")
  })

  it("has globals import", () => {
    expect(standaloneImports.globals).toContain("globals")
  })

  it("has oxlint plugin import", () => {
    expect(standaloneImports.oxlintPlugin).toContain("eslint-plugin-oxlint")
  })
})
