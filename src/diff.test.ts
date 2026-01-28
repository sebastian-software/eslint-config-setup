import { describe, expect, it } from "vitest"

import { diffLintConfig } from "./diff"
import type { ConfigWithModuleRefs } from "./generator"

describe("diffLintConfig", () => {
  it("returns null for identical configs", () => {
    const config: ConfigWithModuleRefs = {
      rules: { "no-console": "warn" }
    }
    expect(diffLintConfig(config, { ...config })).toBeNull()
  })

  it("returns null for two empty configs", () => {
    expect(diffLintConfig({}, {})).toBeNull()
  })

  // Rules

  it("detects changed rules", () => {
    const base: ConfigWithModuleRefs = {
      rules: { "no-console": "warn", "no-debugger": "error" }
    }
    const other: ConfigWithModuleRefs = {
      rules: { "no-console": "error", "no-debugger": "error" }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({ rules: { "no-console": "error" } })
  })

  it("detects added rules", () => {
    const base: ConfigWithModuleRefs = {
      rules: { "no-console": "warn" }
    }
    const other: ConfigWithModuleRefs = {
      rules: { "no-console": "warn", "no-debugger": "error" }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({ rules: { "no-debugger": "error" } })
  })

  it("detects removed rules (undefined in other)", () => {
    const base: ConfigWithModuleRefs = {
      rules: { "no-console": "warn", "no-debugger": "error" }
    }
    const other: ConfigWithModuleRefs = {
      rules: { "no-console": "warn" }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({ rules: { "no-debugger": undefined } })
  })

  // Settings

  it("detects changed settings", () => {
    const base: ConfigWithModuleRefs = {
      settings: { react: { version: "17" } }
    }
    const other: ConfigWithModuleRefs = {
      settings: { react: { version: "18" } }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({ settings: { react: { version: "18" } } })
  })

  it("ignores identical settings", () => {
    const config: ConfigWithModuleRefs = {
      settings: { react: { version: "18" } }
    }
    expect(diffLintConfig(config, { ...config })).toBeNull()
  })

  // Language options

  it("detects changed languageOptions", () => {
    const base: ConfigWithModuleRefs = {
      languageOptions: { parser: "ts" }
    }
    const other: ConfigWithModuleRefs = {
      languageOptions: { parser: "babel" }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({ languageOptions: { parser: "babel" } })
  })

  it("ignores languageOptions when other has none", () => {
    const base: ConfigWithModuleRefs = {
      languageOptions: { parser: "ts" }
    }
    expect(diffLintConfig(base, {})).toBeNull()
  })

  // Linter options

  it("detects changed linterOptions", () => {
    const base: ConfigWithModuleRefs = {
      linterOptions: { reportUnusedDisableDirectives: "off" }
    }
    const other: ConfigWithModuleRefs = {
      linterOptions: { reportUnusedDisableDirectives: "error" }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({
      linterOptions: { reportUnusedDisableDirectives: "error" }
    })
  })

  // Plugins

  it("detects new plugins", () => {
    const base: ConfigWithModuleRefs = {
      plugins: { react: "[[[eslint-plugin-react]]]" }
    }
    const other: ConfigWithModuleRefs = {
      plugins: {
        react: "[[[eslint-plugin-react]]]",
        vitest: "[[[eslint-plugin-vitest]]]"
      }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({
      plugins: { vitest: "[[[eslint-plugin-vitest]]]" }
    })
  })

  it("does not report existing plugins", () => {
    const config: ConfigWithModuleRefs = {
      plugins: { react: "[[[eslint-plugin-react]]]" }
    }
    expect(diffLintConfig(config, { ...config })).toBeNull()
  })

  // Combined

  it("returns diff with multiple sections changed", () => {
    const base: ConfigWithModuleRefs = {
      rules: { "no-console": "warn" },
      settings: { react: { version: "17" } }
    }
    const other: ConfigWithModuleRefs = {
      rules: { "no-console": "error" },
      settings: { react: { version: "18" } }
    }
    const diff = diffLintConfig(base, other)
    expect(diff).toEqual({
      rules: { "no-console": "error" },
      settings: { react: { version: "18" } }
    })
  })
})
