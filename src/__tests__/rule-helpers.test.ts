import { describe, expect, it } from "vitest"

import {
  addRule,
  configureRule,
  disableAllRulesBut,
  disableRule,
  setRuleSeverity,
} from "../api/rule-helpers.ts"
import { composeConfig } from "../build/compose.ts"
import type { FlatConfigArray } from "../types.ts"

function makeConfig(): FlatConfigArray {
  return [
    {
      name: "test/base",
      rules: {
        "no-console": "error",
        complexity: ["error", 10],
        "no-var": "warn",
        "max-depth": ["warn", 4],
      },
    },
    {
      name: "test/override",
      rules: {
        complexity: ["warn", 5],
      },
    },
    {
      name: "test/no-rules",
    },
  ]
}

// --- setRuleSeverity ---

describe("setRuleSeverity", () => {
  it("changes severity of a simple string rule", () => {
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

  it("ignores blocks without rules object", () => {
    const config = makeConfig()
    setRuleSeverity(config, "no-console", "warn")
    // Block 2 (test/no-rules) should remain unchanged
    expect(config[2].rules).toBeUndefined()
  })

  it("does nothing for a rule that does not exist anywhere", () => {
    const config = makeConfig()
    const before = JSON.stringify(config)
    setRuleSeverity(config, "nonexistent-rule", "error")
    expect(JSON.stringify(config)).toBe(before)
  })

  it("preserves complex rule options with multiple entries", () => {
    const config: FlatConfigArray = [
      {
        rules: {
          "@typescript-eslint/naming-convention": [
            "error",
            { selector: "variable", format: ["camelCase"] },
            { selector: "typeLike", format: ["PascalCase"] },
          ],
        },
      },
    ]
    setRuleSeverity(config, "@typescript-eslint/naming-convention", "warn")
    expect(config[0].rules!["@typescript-eslint/naming-convention"]).toEqual([
      "warn",
      { selector: "variable", format: ["camelCase"] },
      { selector: "typeLike", format: ["PascalCase"] },
    ])
  })

  it("works with 'off' as initial severity", () => {
    const config: FlatConfigArray = [
      { rules: { "some-rule": "off" } },
    ]
    setRuleSeverity(config, "some-rule", "error")
    expect(config[0].rules!["some-rule"]).toBe("error")
  })
})

// --- configureRule ---

describe("configureRule", () => {
  it("updates options while preserving severity", () => {
    const config = makeConfig()
    configureRule(config, "complexity", [20])
    expect(config[0].rules!.complexity).toEqual(["error", 20])
    expect(config[1].rules!.complexity).toEqual(["warn", 20])
  })

  it("replaces multiple option entries", () => {
    const config: FlatConfigArray = [
      {
        rules: {
          "@typescript-eslint/naming-convention": [
            "error",
            { selector: "variable", format: ["camelCase"] },
          ],
        },
      },
    ]
    configureRule(config, "@typescript-eslint/naming-convention", [
      { selector: "variable", format: ["snake_case"] },
      { selector: "function", format: ["camelCase"] },
    ])
    expect(
      config[0].rules!["@typescript-eslint/naming-convention"],
    ).toEqual([
      "error",
      { selector: "variable", format: ["snake_case"] },
      { selector: "function", format: ["camelCase"] },
    ])
  })

  it("converts a string-only rule to array format", () => {
    const config = makeConfig()
    configureRule(config, "no-console", [{ allow: ["warn", "error"] }])
    expect(config[0].rules!["no-console"]).toEqual([
      "error",
      { allow: ["warn", "error"] },
    ])
  })

  it("ignores blocks without the rule", () => {
    const config = makeConfig()
    configureRule(config, "no-var", ["always"])
    expect(config[0].rules!["no-var"]).toEqual(["warn", "always"])
    expect(config[1].rules!["no-var"]).toBeUndefined()
  })
})

// --- disableRule ---

describe("disableRule", () => {
  it("sets the rule to off in all blocks", () => {
    const config = makeConfig()
    disableRule(config, "complexity")
    expect(config[0].rules!.complexity).toBe("off")
    expect(config[1].rules!.complexity).toBe("off")
  })

  it("handles rules that only exist in one block", () => {
    const config = makeConfig()
    disableRule(config, "no-console")
    expect(config[0].rules!["no-console"]).toBe("off")
    expect(config[1].rules!["no-console"]).toBeUndefined()
  })

  it("is idempotent", () => {
    const config = makeConfig()
    disableRule(config, "complexity")
    disableRule(config, "complexity")
    expect(config[0].rules!.complexity).toBe("off")
  })
})

// --- addRule ---

describe("addRule", () => {
  it("adds a simple rule to the first block", () => {
    const config = makeConfig()
    addRule(config, "new-rule", "error")
    expect(config[0].rules!["new-rule"]).toBe("error")
    expect(config[1].rules!["new-rule"]).toBeUndefined()
  })

  it("adds a rule with options to the first block", () => {
    const config = makeConfig()
    addRule(config, "max-depth", "error", [3])
    expect(config[0].rules!["max-depth"]).toEqual(["error", 3])
  })

  it("adds a rule with complex options", () => {
    const config = makeConfig()
    addRule(config, "max-lines-per-function", "error", [
      { max: 50, skipBlankLines: true, skipComments: true },
    ])
    expect(config[0].rules!["max-lines-per-function"]).toEqual([
      "error",
      { max: 50, skipBlankLines: true, skipComments: true },
    ])
  })

  it("overwrites an existing rule in the first block", () => {
    const config = makeConfig()
    addRule(config, "no-console", "warn")
    expect(config[0].rules!["no-console"]).toBe("warn")
  })

  it("creates rules object if first block has none", () => {
    const config: FlatConfigArray = [{ name: "empty" }]
    addRule(config, "new-rule", "error")
    expect(config[0].rules!["new-rule"]).toBe("error")
  })

  it("does nothing on empty config array", () => {
    const config: FlatConfigArray = []
    addRule(config, "new-rule", "error")
    expect(config).toHaveLength(0)
  })
})

// --- disableAllRulesBut ---

describe("disableAllRulesBut", () => {
  it("disables all rules except the specified one", () => {
    const config = makeConfig()
    disableAllRulesBut(config, "no-console")
    expect(config[0].rules!["no-console"]).toBe("error")
    expect(config[0].rules!.complexity).toBe("off")
    expect(config[0].rules!["no-var"]).toBe("off")
    expect(config[0].rules!["max-depth"]).toBe("off")
    expect(config[1].rules!.complexity).toBe("off")
  })

  it("handles a rule that exists in multiple blocks", () => {
    const config = makeConfig()
    disableAllRulesBut(config, "complexity")
    expect(config[0].rules!.complexity).toEqual(["error", 10])
    expect(config[1].rules!.complexity).toEqual(["warn", 5])
    expect(config[0].rules!["no-console"]).toBe("off")
  })

  it("disables everything if the keep rule does not exist", () => {
    const config = makeConfig()
    disableAllRulesBut(config, "nonexistent-rule")
    expect(config[0].rules!["no-console"]).toBe("off")
    expect(config[0].rules!.complexity).toBe("off")
  })

  it("skips blocks without rules", () => {
    const config = makeConfig()
    disableAllRulesBut(config, "no-console")
    expect(config[2].rules).toBeUndefined()
  })
})

// --- Scoped operations ---

function makeScopedConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/base",
      rules: {
        "no-console": "error",
        complexity: ["error", 10],
      },
    },
    {
      name: "@effective/eslint/tests",
      rules: {
        "no-console": "warn",
      },
    },
    {
      name: "@effective/eslint/tests-react",
      rules: {
        "testing-library/no-unnecessary-act": "error",
      },
    },
    {
      name: "@effective/eslint/scripts",
      rules: {
        "no-console": "off",
      },
    },
  ]
}

describe("scoped setRuleSeverity", () => {
  it("changes severity only in matching scope", () => {
    const config = makeScopedConfig()
    setRuleSeverity(config, "no-console", "off", { scope: "tests" })
    // tests block changed
    expect(config[1].rules!["no-console"]).toBe("off")
    // base block unchanged
    expect(config[0].rules!["no-console"]).toBe("error")
    // scripts block unchanged
    expect(config[3].rules!["no-console"]).toBe("off") // was already off
  })

  it("matches prefix blocks (tests matches tests-react)", () => {
    const config = makeScopedConfig()
    setRuleSeverity(config, "testing-library/no-unnecessary-act", "warn", {
      scope: "tests",
    })
    expect(config[2].rules!["testing-library/no-unnecessary-act"]).toBe("warn")
  })

  it("does nothing if scope has no matching blocks", () => {
    const config = makeScopedConfig()
    const before = JSON.stringify(config)
    setRuleSeverity(config, "no-console", "off", { scope: "e2e" })
    expect(JSON.stringify(config)).toBe(before)
  })
})

describe("scoped configureRule", () => {
  it("updates options only in matching scope", () => {
    const config = makeScopedConfig()
    configureRule(config, "no-console", [{ allow: ["warn"] }], {
      scope: "tests",
    })
    expect(config[1].rules!["no-console"]).toEqual([
      "warn",
      { allow: ["warn"] },
    ])
    // base unchanged
    expect(config[0].rules!["no-console"]).toBe("error")
  })

  it("ignores non-matching blocks", () => {
    const config = makeScopedConfig()
    configureRule(config, "no-console", [{ allow: ["warn"] }], {
      scope: "scripts",
    })
    expect(config[3].rules!["no-console"]).toEqual([
      "off",
      { allow: ["warn"] },
    ])
    // base unchanged
    expect(config[0].rules!["no-console"]).toBe("error")
  })

  it("maps configs scope to config-files blocks", () => {
    const config: FlatConfigArray = [
      {
        name: "@effective/eslint/base",
        rules: { complexity: ["error", 10] },
      },
      {
        name: "@effective/eslint/config-files",
        rules: { complexity: ["error", 10] },
      },
    ]
    configureRule(config, "complexity", [50], { scope: "configs" })
    expect(config[1].rules!.complexity).toEqual(["error", 50])
    // base unchanged
    expect(config[0].rules!.complexity).toEqual(["error", 10])
  })
})

describe("scoped disableRule", () => {
  it("disables rule in first matching block", () => {
    const config = makeScopedConfig()
    disableRule(config, "no-console", { scope: "tests" })
    expect(config[1].rules!["no-console"]).toBe("off")
    // base unchanged
    expect(config[0].rules!["no-console"]).toBe("error")
  })

  it("creates rule entry if block doesn't have it", () => {
    const config = makeScopedConfig()
    disableRule(config, "complexity", { scope: "tests" })
    expect(config[1].rules!.complexity).toBe("off")
  })

  it("creates rules object if block has none", () => {
    const config: FlatConfigArray = [
      { name: "@effective/eslint/e2e" },
    ]
    disableRule(config, "no-console", { scope: "e2e" })
    expect(config[0].rules!["no-console"]).toBe("off")
  })
})

describe("scoped addRule", () => {
  it("adds rule to first matching block instead of base", () => {
    const config = makeScopedConfig()
    addRule(config, "vitest/no-focused-tests", "error", { scope: "tests" })
    expect(config[1].rules!["vitest/no-focused-tests"]).toBe("error")
    expect(config[0].rules!["vitest/no-focused-tests"]).toBeUndefined()
  })

  it("adds rule with options to scoped block", () => {
    const config = makeScopedConfig()
    addRule(config, "no-restricted-syntax", "error", [{ selector: "ForInStatement" }], { scope: "scripts" })
    expect(config[3].rules!["no-restricted-syntax"]).toEqual([
      "error",
      { selector: "ForInStatement" },
    ])
  })

  it("does nothing if scope has no matching blocks", () => {
    const config = makeScopedConfig()
    const before = JSON.stringify(config)
    addRule(config, "new-rule", "error", { scope: "e2e" })
    expect(JSON.stringify(config)).toBe(before)
  })
})

// --- Integration: Helpers on real composed configs ---

describe("rule helpers on composed configs", () => {
  it("can disable a rule from a real base config", () => {
    const config = composeConfig({})
    const baseBlock = config.find((b) => b.name === "@effective/eslint/base")
    expect(baseBlock?.rules?.["eqeqeq"]).toEqual(["error", "smart"])

    disableRule(config, "eqeqeq")
    expect(baseBlock?.rules?.["eqeqeq"]).toBe("off")
  })

  it("can change complexity severity on a real config", () => {
    const config = composeConfig({})
    const complexityBlock = config.find(
      (b) => b.name === "@effective/eslint/complexity",
    )
    expect(complexityBlock?.rules?.complexity).toEqual(["error", 10])

    setRuleSeverity(config, "complexity", "warn")
    expect(complexityBlock?.rules?.complexity).toEqual(["warn", 10])
  })

  it("can reconfigure complexity limits on an AI config", () => {
    const config = composeConfig({ ai: true })
    const aiComplexity = config.find(
      (b) => b.name === "@effective/eslint/ai-complexity",
    )
    expect(aiComplexity?.rules?.complexity).toEqual(["error", 10])

    configureRule(config, "complexity", [25])
    expect(aiComplexity?.rules?.complexity).toEqual(["error", 25])
  })

  it("can add a custom rule to a composed config", () => {
    const config = composeConfig({})
    addRule(config, "no-alert", "error")
    expect(config[0].rules!["no-alert"]).toBe("error")
  })

  it("can disable AI naming-convention and explicit-return-type", () => {
    const config = composeConfig({ ai: true })

    const aiTsBlock = config.find(
      (b) => b.name === "@effective/eslint/ai-typescript",
    )
    expect(
      aiTsBlock?.rules?.["@typescript-eslint/explicit-function-return-type"],
    ).toBeDefined()

    disableRule(config, "@typescript-eslint/explicit-function-return-type")
    disableRule(config, "@typescript-eslint/naming-convention")

    expect(
      aiTsBlock?.rules?.["@typescript-eslint/explicit-function-return-type"],
    ).toBe("off")
    expect(
      aiTsBlock?.rules?.["@typescript-eslint/naming-convention"],
    ).toBe("off")
  })

  it("can chain multiple operations", () => {
    const config = composeConfig({ react: true, ai: true })

    // Disable a rule
    disableRule(config, "unicorn/prevent-abbreviations")

    // Change severity
    setRuleSeverity(config, "no-console", "warn")

    // Reconfigure complexity
    configureRule(config, "complexity", [20])

    // Add a new rule
    addRule(config, "no-alert", "error")

    // Verify all changes
    const aiUnicorn = config.find(
      (b) => b.name === "@effective/eslint/ai-unicorn",
    )
    expect(aiUnicorn?.rules?.["unicorn/prevent-abbreviations"]).toBe("off")

    const aiComplexity = config.find(
      (b) => b.name === "@effective/eslint/ai-complexity",
    )
    expect(aiComplexity?.rules?.complexity).toEqual(["error", 20])

    expect(config[0].rules!["no-alert"]).toBe("error")
  })
})
