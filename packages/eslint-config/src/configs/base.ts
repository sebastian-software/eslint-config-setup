import type { Linter } from "eslint"

import eslint from "@eslint/js"

import type { FlatConfigArray } from "../types"

import { createConfig } from "../build/config-builder"

type Builder = ReturnType<typeof createConfig>

const ERROR_PREVENTION_RULES = {
  "accessor-pairs": ["error", { enforceForClassMembers: true }],
  "array-callback-return": ["error", { allowImplicit: true }],
  "no-constructor-return": "error",
  "no-promise-executor-return": "error",
  "no-self-compare": "error",
  "no-template-curly-in-string": "error",
  "no-unreachable-loop": "error",
  "require-atomic-updates": "error",
  "no-unmodified-loop-condition": "error",
  "grouped-accessor-pairs": ["error", "getBeforeSet"],
  "no-useless-rename": "error",
  "no-useless-computed-key": ["error", { enforceForClassMembers: true }],
} satisfies Linter.RulesRecord

const DANGEROUS_PATTERN_RULES = {
  "no-eval": "error",
  "no-alert": "error",
  "no-caller": "error",
  "no-extend-native": "error",
  "no-new-func": "error",
  "no-new-wrappers": "error",
  "no-object-constructor": "error",
  "no-proto": "error",
  "no-iterator": "error",
  "no-script-url": "error",
  "no-octal-escape": "error",
  "no-implicit-globals": "error",
} satisfies Linter.RulesRecord

const CODE_QUALITY_RULES = {
  eqeqeq: ["error", "smart"],
  "guard-for-in": "error",
  "default-case-last": "error",
  radix: "error",
  yoda: "error",
  "no-sequences": ["error", { allowInParentheses: false }],
  "no-new": "error",
  "no-labels": "error",
  "no-extra-bind": "error",
  "no-lone-blocks": "error",
  "no-useless-call": "error",
  "no-useless-concat": "error",
  "no-useless-return": "error",
  "no-return-assign": ["error", "always"],
  "no-multi-str": "error",
  "prefer-regex-literals": ["error", { disallowRedundantWrapping: true }],
} satisfies Linter.RulesRecord

const MODERN_STYLE_RULES = {
  "no-var": "error",
  "prefer-const": ["error", { destructuring: "all" }],
  "prefer-object-has-own": "error",
  "prefer-object-spread": "error",
  "prefer-rest-params": "error",
  "prefer-spread": "error",
  "symbol-description": "error",
  "prefer-numeric-literals": "error",
  "object-shorthand": ["error", "always", { avoidExplicitReturnArrows: true, avoidQuotes: true }],
} satisfies Linter.RulesRecord

const AI_STRUCTURAL_RULES = {
  curly: ["error", "all"],
  "no-else-return": ["error", { allowElseIf: false }],
  "no-nested-ternary": "error",
  "no-unneeded-ternary": "error",
  "no-negated-condition": "error",
  "no-lonely-if": "error",
  "no-param-reassign": ["error", { props: true }],
  "no-multi-assign": "error",
  "one-var": ["error", "never"],
  "no-implicit-coercion": "error",
  "arrow-body-style": "error",
  "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
  "logical-assignment-operators": ["error", "always", { enforceForIfStatements: true }],
  "max-statements-per-line": ["error", { max: 1 }],
  "prefer-exponentiation-operator": "error",
  "prefer-named-capture-group": "error",
  "require-unicode-regexp": "error",
  "no-warning-comments": "warn",
  "no-await-in-loop": "error",
} satisfies Linter.RulesRecord

function addRules(builder: Builder, rules: Linter.RulesRecord): void {
  for (const [ruleName, value] of Object.entries(rules)) {
    builder.addRule(ruleName, value)
  }
}

function addBaseOverrides(builder: Builder): void {
  builder.overrideRule("use-isnan", ["error", { enforceForIndexOf: true, enforceForSwitchCase: true }])
  builder.overrideRule("valid-typeof", ["error", { requireStringLiterals: true }])
}

function addComplexityRules(builder: Builder, isAi: boolean): void {
  builder.addRule("complexity", ["error", isAi ? 10 : 20])
  builder.addRule("max-depth", ["error", isAi ? 3 : 5])
  builder.addRule("max-nested-callbacks", ["error", isAi ? 2 : 4])
  builder.addRule("max-params", ["error", isAi ? 3 : 5])
  builder.addRule("max-statements", ["error", isAi ? 15 : 25])
  builder.addRule("max-lines-per-function", [
    "error",
    { max: isAi ? 100 : 200, skipBlankLines: true, skipComments: true },
  ])
  builder.addRule("max-lines", [
    "error",
    { max: isAi ? 300 : 500, skipBlankLines: true, skipComments: true },
  ])
  builder.addRule("sonarjs/cognitive-complexity", ["error", isAi ? 10 : 20])
}

function addModernStyleRules(builder: Builder, isAi: boolean): void {
  addRules(builder, MODERN_STYLE_RULES)
  builder.addRule("prefer-template", isAi ? "error" : "warn")
}

/**
 * Base ESLint config — extends `eslint.configs.recommended` with additional
 * best-practice rules for error prevention and modern JS style.
 *
 * Rules with TypeScript equivalents (no-implied-eval, dot-notation, etc.)
 * are NOT included here — they are handled by the typescript-eslint presets.
 *
 * Preset: `@eslint/js` recommended
 * @see https://eslint.org/docs/latest/rules/
 */
export function baseConfig(opts?: { ai?: boolean }): FlatConfigArray {
  const isAi = opts?.ai ?? false

  const builder = createConfig({
    name: "eslint-config-setup/base",
    presets: [eslint.configs.recommended],
  })

  addRules(builder, ERROR_PREVENTION_RULES)
  addBaseOverrides(builder)
  addRules(builder, DANGEROUS_PATTERN_RULES)
  addRules(builder, CODE_QUALITY_RULES)
  addComplexityRules(builder, isAi)
  addModernStyleRules(builder, isAi)

  if (isAi) {
    addRules(builder, AI_STRUCTURAL_RULES)
  }

  return builder.build()
}
