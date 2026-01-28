import { describe, expect, it } from "vitest"
import type { Linter } from "eslint"

import { addRule, configureRule, disableAllRulesBut, disableRule, setRuleSeverity } from "./index"

function makeConfig(rules: Linter.RulesRecord): Linter.Config[] {
  return [{ name: "effective/base", rules }]
}

describe("setRuleSeverity", () => {
  it("changes a simple string severity", () => {
    const config = makeConfig({ "no-console": "warn" })
    setRuleSeverity(config, "no-console", "error")
    expect(config[0].rules!["no-console"]).toBe("error")
  })

  it("changes severity of an array rule config", () => {
    const config = makeConfig({ "max-lines": ["warn", { max: 300 }] })
    setRuleSeverity(config, "max-lines", "error")
    expect(config[0].rules!["max-lines"]).toEqual(["error", { max: 300 }])
  })

  it("throws when the rule is not configured", () => {
    const config = makeConfig({ "no-console": "warn" })
    expect(() => setRuleSeverity(config, "no-debugger", "error")).toThrow(
      "Rule no-debugger is not configured!"
    )
  })

  it("throws when config has no rules", () => {
    const config: Linter.Config[] = [{ name: "effective/base" }]
    expect(() => setRuleSeverity(config, "no-console", "error")).toThrow("has no rules")
  })

  it("throws when config object is not found", () => {
    expect(() => setRuleSeverity([], "no-console", "error")).toThrow("not found")
  })

  it("works with a specific config object name", () => {
    const config: Linter.Config[] = [
      { name: "effective/base", rules: { "no-console": "warn" } },
      { name: "effective/test", rules: { "no-console": "warn" } }
    ]
    setRuleSeverity(config, "no-console", "off", "test")
    expect(config[0].rules!["no-console"]).toBe("warn")
    expect(config[1].rules!["no-console"]).toBe("off")
  })
})

describe("configureRule", () => {
  it("preserves severity and adds options", () => {
    const config = makeConfig({ "max-lines": "error" })
    configureRule(config, "max-lines", "base", [{ max: 500 }])
    expect(config[0].rules!["max-lines"]).toEqual(["error", { max: 500 }])
  })

  it("preserves severity from array config and adds options", () => {
    const config = makeConfig({ "max-lines": ["warn", { max: 300 }] })
    configureRule(config, "max-lines", "base", [{ max: 500 }])
    expect(config[0].rules!["max-lines"]).toEqual(["warn", { max: 500 }])
  })

  it("simplifies to severity-only when no options provided", () => {
    const config = makeConfig({ "max-lines": ["warn", { max: 300 }] })
    configureRule(config, "max-lines")
    expect(config[0].rules!["max-lines"]).toBe("warn")
  })

  it("simplifies to severity-only when options array is empty", () => {
    const config = makeConfig({ "max-lines": ["error", { max: 300 }] })
    configureRule(config, "max-lines", "base", [])
    expect(config[0].rules!["max-lines"]).toBe("error")
  })

  it("throws when the rule is not configured", () => {
    const config = makeConfig({ "no-console": "warn" })
    expect(() => configureRule(config, "no-debugger")).toThrow("not configured")
  })

  it("throws when config has no rules", () => {
    const config: Linter.Config[] = [{ name: "effective/base" }]
    expect(() => configureRule(config, "no-console")).toThrow("has no rules")
  })
})

describe("disableRule", () => {
  it("removes the rule from config", () => {
    const config = makeConfig({ "no-console": "warn", "no-debugger": "error" })
    disableRule(config, "no-console")
    expect(config[0].rules!["no-console"]).toBeUndefined()
    expect(config[0].rules!["no-debugger"]).toBe("error")
  })

  it("throws when the rule is not configured", () => {
    const config = makeConfig({ "no-console": "warn" })
    expect(() => disableRule(config, "no-debugger")).toThrow("not configured")
  })

  it("throws when config has no rules", () => {
    const config: Linter.Config[] = [{ name: "effective/base" }]
    expect(() => disableRule(config, "no-console")).toThrow("has no rules")
  })
})

describe("addRule", () => {
  it("adds a new rule with severity only", () => {
    const config = makeConfig({ "no-console": "warn" })
    addRule(config, "no-debugger", "error")
    expect(config[0].rules!["no-debugger"]).toBe("error")
  })

  it("adds a new rule with severity and options", () => {
    const config = makeConfig({})
    addRule(config, "max-lines", "warn", "base", [{ max: 300 }])
    expect(config[0].rules!["max-lines"]).toEqual(["warn", { max: 300 }])
  })

  it("throws when the rule is already configured", () => {
    const config = makeConfig({ "no-console": "warn" })
    expect(() => addRule(config, "no-console", "error")).toThrow("already configured")
  })

  it("throws when config has no rules", () => {
    const config: Linter.Config[] = [{ name: "effective/base" }]
    expect(() => addRule(config, "no-console", "error")).toThrow("has no rules")
  })
})

describe("disableAllRulesBut", () => {
  it("turns off all rules except the specified one", () => {
    const config = makeConfig({
      "no-console": "warn",
      "no-debugger": "error",
      "max-lines": ["error", { max: 300 }]
    })
    disableAllRulesBut(config, "no-console")
    expect(config[0].rules!["no-console"]).toBe("warn")
    expect(config[0].rules!["no-debugger"]).toBe("off")
    expect(config[0].rules!["max-lines"]).toBe("off")
  })

  it("throws when config has no rules", () => {
    const config: Linter.Config[] = [{ name: "effective/base" }]
    expect(() => disableAllRulesBut(config, "no-console")).toThrow("has no rules")
  })

  it("works with a specific config object name", () => {
    const config: Linter.Config[] = [
      { name: "effective/base", rules: { "no-console": "warn", "no-debugger": "error" } },
      { name: "effective/test", rules: { "no-console": "warn", "no-debugger": "error" } }
    ]
    disableAllRulesBut(config, "no-console", "test")
    // base should be untouched
    expect(config[0].rules!["no-debugger"]).toBe("error")
    // test should have no-debugger off
    expect(config[1].rules!["no-debugger"]).toBe("off")
    expect(config[1].rules!["no-console"]).toBe("warn")
  })
})
