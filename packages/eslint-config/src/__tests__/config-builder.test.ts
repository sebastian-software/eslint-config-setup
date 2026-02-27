import { describe, expect, it } from "vitest"
import eslint from "@eslint/js"

import { createConfig } from "../build/config-builder"

describe("createConfig", () => {
  const fakePreset = {
    plugins: { "fake-plugin": {} },
    rules: {
      "fake/rule-a": "error" as const,
      "fake/rule-b": ["warn", { option: true }] as const,
      "fake/rule-c": "error" as const,
    },
  }

  describe("overrideRule", () => {
    it("overrides an existing preset rule", () => {
      const result = createConfig({
        name: "test",
        presets: [fakePreset],
      })
        .overrideRule("fake/rule-a", "warn")
        .build()

      expect(result[0].rules!["fake/rule-a"]).toBe("warn")
    })

    it("throws if rule not in preset", () => {
      expect(() =>
        createConfig({ name: "test", presets: [fakePreset] }).overrideRule(
          "fake/nonexistent",
          "error",
        ),
      ).toThrow('overrideRule("fake/nonexistent")')
    })
  })

  describe("addRule", () => {
    it("adds a new rule not in preset", () => {
      const result = createConfig({
        name: "test",
        presets: [fakePreset],
      })
        .addRule("fake/rule-d", "error")
        .build()

      expect(result[0].rules!["fake/rule-d"]).toBe("error")
    })

    it("throws if rule already in preset", () => {
      expect(() =>
        createConfig({ name: "test", presets: [fakePreset] }).addRule(
          "fake/rule-a",
          "error",
        ),
      ).toThrow('addRule("fake/rule-a")')
    })

    it("throws if rule already added", () => {
      expect(() =>
        createConfig({ name: "test", presets: [fakePreset] })
          .addRule("fake/rule-d", "error")
          .addRule("fake/rule-d", "warn"),
      ).toThrow('addRule("fake/rule-d")')
    })
  })

  describe("disableRule", () => {
    it("disables a preset rule", () => {
      const result = createConfig({
        name: "test",
        presets: [fakePreset],
      })
        .disableRule("fake/rule-a")
        .build()

      expect(result[0].rules!["fake/rule-a"]).toBe("off")
    })

    it("disables an added rule", () => {
      const result = createConfig({
        name: "test",
        presets: [fakePreset],
      })
        .addRule("fake/rule-d", "error")
        .disableRule("fake/rule-d")
        .build()

      expect(result[0].rules!["fake/rule-d"]).toBe("off")
    })

    it("throws if rule not found", () => {
      expect(() =>
        createConfig({ name: "test", presets: [fakePreset] }).disableRule(
          "fake/nonexistent",
        ),
      ).toThrow('disableRule("fake/nonexistent")')
    })
  })

  describe("removeRule", () => {
    it("removes a preset rule from output", () => {
      const result = createConfig({
        name: "test",
        presets: [fakePreset],
      })
        .removeRule("fake/rule-a")
        .build()

      expect(result[0].rules!["fake/rule-a"]).toBeUndefined()
    })

    it("throws if rule not found", () => {
      expect(() =>
        createConfig({ name: "test", presets: [fakePreset] }).removeRule(
          "fake/nonexistent",
        ),
      ).toThrow('removeRule("fake/nonexistent")')
    })
  })

  describe("build", () => {
    it("sets the name on the output block", () => {
      const result = createConfig({
        name: "my-config",
        presets: [fakePreset],
      }).build()

      expect(result[0].name).toBe("my-config")
    })

    it("merges plugins from preset and user", () => {
      const result = createConfig({
        name: "test",
        presets: [fakePreset],
        plugins: { "my-plugin": {} },
      }).build()

      expect(result[0].plugins).toHaveProperty("fake-plugin")
      expect(result[0].plugins).toHaveProperty("my-plugin")
    })

    it("includes languageOptions, settings, files, ignores", () => {
      const result = createConfig({
        name: "test",
        presets: [fakePreset],
        languageOptions: { ecmaVersion: 2022 },
        settings: { react: { version: "19" } },
        files: ["**/*.ts"],
        ignores: ["dist/**"],
      }).build()

      expect(result[0].languageOptions).toEqual({ ecmaVersion: 2022 })
      expect(result[0].settings).toEqual({ react: { version: "19" } })
      expect(result[0].files).toEqual(["**/*.ts"])
      expect(result[0].ignores).toEqual(["dist/**"])
    })

    it("prepends passthrough blocks before main block", () => {
      const passBlock = { name: "pass", rules: { "some-rule": "off" as const } }
      const result = createConfig({
        name: "main",
        passthrough: [passBlock],
        presets: [fakePreset],
      }).build()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe("pass")
      expect(result[1].name).toBe("main")
    })
  })

  describe("addFileOverride", () => {
    it("appends file override block after main block", () => {
      const result = createConfig({
        name: "main",
        presets: [fakePreset],
      })
        .addFileOverride("override", ["**/*.js"], { "fake/rule-a": "off" })
        .build()

      expect(result).toHaveLength(2)
      expect(result[1].name).toBe("override")
      expect(result[1].files).toEqual(["**/*.js"])
      expect(result[1].rules!["fake/rule-a"]).toBe("off")
    })
  })

  describe("preset expansion", () => {
    it("merges rules from multiple presets (last wins)", () => {
      const preset1 = { rules: { "rule-a": "error" as const, "rule-b": "warn" as const } }
      const preset2 = { rules: { "rule-b": "error" as const, "rule-c": "warn" as const } }

      const result = createConfig({
        name: "test",
        presets: [preset1, preset2],
      }).build()

      expect(result[0].rules!["rule-a"]).toBe("error")
      expect(result[0].rules!["rule-b"]).toBe("error") // last wins
      expect(result[0].rules!["rule-c"]).toBe("warn")
    })

    it("merges plugins from multiple presets", () => {
      const preset1 = { plugins: { a: {} }, rules: {} }
      const preset2 = { plugins: { b: {} }, rules: {} }

      const result = createConfig({
        name: "test",
        presets: [preset1, preset2],
      }).build()

      expect(result[0].plugins).toHaveProperty("a")
      expect(result[0].plugins).toHaveProperty("b")
    })
  })

  describe("with real eslint recommended preset", () => {
    it("expands eslint recommended rules", () => {
      const result = createConfig({
        name: "test",
        presets: [eslint.configs.recommended],
      }).build()

      // eslint recommended has no-unused-vars
      expect(result[0].rules!["no-unused-vars"]).toBe("error")
    })

    it("allows overriding eslint recommended rules", () => {
      const result = createConfig({
        name: "test",
        presets: [eslint.configs.recommended],
      })
        .overrideRule("no-unused-vars", "warn")
        .build()

      expect(result[0].rules!["no-unused-vars"]).toBe("warn")
    })

    it("throws when adding a rule that's already in recommended", () => {
      expect(() =>
        createConfig({
          name: "test",
          presets: [eslint.configs.recommended],
        }).addRule("no-unused-vars", "error"),
      ).toThrow('addRule("no-unused-vars")')
    })
  })

  describe("no presets", () => {
    it("works with no presets (empty rules)", () => {
      const result = createConfig({ name: "test" })
        .addRule("my-rule", "error")
        .build()

      expect(result).toHaveLength(1)
      expect(result[0].rules!["my-rule"]).toBe("error")
    })
  })
})
