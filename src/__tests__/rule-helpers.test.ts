import { describe, expect, it } from "vitest"

import {
  addRule,
  configureRule,
  disableAllRulesBut,
  disableRule,
  setRuleSeverity,
} from "../api/rule-helpers.ts"
import type { FlatConfigArray } from "../types.ts"

function makeConfig(): FlatConfigArray {
  return [
    {
      name: "test/base",
      rules: {
        "no-console": "error",
        complexity: ["error", 10],
        "no-var": "warn",
      },
    },
    {
      name: "test/override",
      rules: {
        complexity: ["warn", 5],
      },
    },
  ]
}

describe("setRuleSeverity", () => {
  it("changes severity of a simple rule", () => {
    const config = makeConfig()
    setRuleSeverity(config, "no-console", "warn")
    expect(config[0].rules!["no-console"]).toBe("warn")
  })

  it("changes severity of an array rule, preserving options", () => {
    const config = makeConfig()
    setRuleSeverity(config, "complexity", "off")
    expect(config[0].rules!.complexity).toEqual(["off", 10])
    expect(config[1].rules!.complexity).toEqual(["off", 5])
  })

  it("ignores blocks that do not have the rule", () => {
    const config = makeConfig()
    setRuleSeverity(config, "no-var", "error")
    expect(config[0].rules!["no-var"]).toBe("error")
    expect(config[1].rules!["no-var"]).toBeUndefined()
  })
})

describe("configureRule", () => {
  it("updates options while preserving severity", () => {
    const config = makeConfig()
    configureRule(config, "complexity", [20])
    expect(config[0].rules!.complexity).toEqual(["error", 20])
    expect(config[1].rules!.complexity).toEqual(["warn", 20])
  })
})

describe("disableRule", () => {
  it("sets the rule to off in all blocks", () => {
    const config = makeConfig()
    disableRule(config, "complexity")
    expect(config[0].rules!.complexity).toBe("off")
    expect(config[1].rules!.complexity).toBe("off")
  })
})

describe("addRule", () => {
  it("adds a simple rule to the first block", () => {
    const config = makeConfig()
    addRule(config, "new-rule", "error")
    expect(config[0].rules!["new-rule"]).toBe("error")
  })

  it("adds a rule with options to the first block", () => {
    const config = makeConfig()
    addRule(config, "max-depth", "error", [3])
    expect(config[0].rules!["max-depth"]).toEqual(["error", 3])
  })
})

describe("disableAllRulesBut", () => {
  it("disables all rules except the specified one", () => {
    const config = makeConfig()
    disableAllRulesBut(config, "no-console")
    expect(config[0].rules!["no-console"]).toBe("error")
    expect(config[0].rules!.complexity).toBe("off")
    expect(config[0].rules!["no-var"]).toBe("off")
    expect(config[1].rules!.complexity).toBe("off")
  })
})
