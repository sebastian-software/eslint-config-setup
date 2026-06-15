/* eslint-disable max-lines -- Rule-surface guardrail: explicit reviewed snapshots are intentionally kept together. */
import type { Linter } from "eslint"

import eslintReactPlugin from "@eslint-react/eslint-plugin"
import oxlintPlugin from "eslint-plugin-oxlint"
import reactHooksPlugin from "eslint-plugin-react-hooks"
// @ts-expect-error -- no type declarations available
import reactPerfPlugin from "eslint-plugin-react-perf"

import {
  AI_ADDED_REACT_RULES,
  AI_PROMOTED_REACT_RULES,
  AI_REACT_PERF_RULES,
  REACT_HOOKS_REPLACED_ESLINT_REACT_RULES,
  reactConfig,
} from "../configs/react"
import { oxlintIntegration } from "../oxlint/integration"
import {
  REACT_COMPAT_LEGACY_ALIAS_NAMES,
  reactCompatPlugin,
} from "../plugins/react-compat"

const EXPECTED_ESLINT_REACT_CONFIGS = [
  "all",
  "disable-conflict-eslint-plugin-react",
  "disable-conflict-eslint-plugin-react-hooks",
  "disable-dom",
  "disable-experimental",
  "disable-jsx",
  "disable-naming-convention",
  "disable-rsc",
  "disable-type-checked",
  "disable-web-api",
  "dom",
  "jsx",
  "naming-convention",
  "off",
  "recommended",
  "recommended-type-checked",
  "recommended-typescript",
  "rsc",
  "strict",
  "strict-type-checked",
  "strict-typescript",
  "web-api",
  "x",
] as const

const EXPECTED_REACT_CONFLICT_RULES = [
  "react/button-has-type",
  "react/destructuring-assignment",
  "react/display-name",
  "react/forbid-prop-types",
  "react/forward-ref-uses-ref",
  "react/hook-use-state",
  "react/iframe-missing-sandbox",
  "react/jsx-boolean-value",
  "react/jsx-filename-extension",
  "react/jsx-fragments",
  "react/jsx-key",
  "react/jsx-no-comment-textnodes",
  "react/jsx-no-constructed-context-values",
  "react/jsx-no-leaked-render",
  "react/jsx-no-script-url",
  "react/jsx-no-target-blank",
  "react/jsx-no-useless-fragment",
  "react/jsx-pascal-case",
  "react/no-access-state-in-setstate",
  "react/no-array-index-key",
  "react/no-children-prop",
  "react/no-danger",
  "react/no-danger-with-children",
  "react/no-deprecated",
  "react/no-did-mount-set-state",
  "react/no-did-update-set-state",
  "react/no-direct-mutation-state",
  "react/no-find-dom-node",
  "react/no-namespace",
  "react/no-object-type-as-default-prop",
  "react/no-render-return-value",
  "react/no-string-refs",
  "react/no-unknown-property",
  "react/no-unsafe",
  "react/no-unstable-nested-components",
  "react/no-unused-class-component-members",
  "react/no-unused-state",
  "react/no-will-update-set-state",
  "react/prop-types",
  "react/void-dom-elements-no-children",
] as const

const EXPECTED_REACT_HOOKS_CONFLICT_RULES = [
  "react-hooks/error-boundaries",
  "react-hooks/exhaustive-deps",
  "react-hooks/globals",
  "react-hooks/immutability",
  "react-hooks/purity",
  "react-hooks/refs",
  "react-hooks/rules-of-hooks",
  "react-hooks/set-state-in-effect",
  "react-hooks/set-state-in-render",
  "react-hooks/unsupported-syntax",
  "react-hooks/use-memo",
] as const

const EXPECTED_REACT_HOOKS_LATEST_RULES = [
  "react-hooks/config",
  "react-hooks/error-boundaries",
  "react-hooks/exhaustive-deps",
  "react-hooks/gating",
  "react-hooks/globals",
  "react-hooks/immutability",
  "react-hooks/incompatible-library",
  "react-hooks/preserve-manual-memoization",
  "react-hooks/purity",
  "react-hooks/refs",
  "react-hooks/rules-of-hooks",
  "react-hooks/set-state-in-effect",
  "react-hooks/set-state-in-render",
  "react-hooks/static-components",
  "react-hooks/unsupported-syntax",
  "react-hooks/use-memo",
  "react-hooks/void-use-memo",
] as const

const EXPECTED_OXLINT_REACT_RULES = [
  "react-refresh/only-export-components",
  "react/button-has-type",
  "react/checked-requires-onchange-or-readonly",
  "react/display-name",
  "react/forbid-component-props",
  "react/forbid-dom-props",
  "react/forbid-elements",
  "react/forward-ref-uses-ref",
  "react/hook-use-state",
  "react/iframe-missing-sandbox",
  "react/jsx-boolean-value",
  "react/jsx-curly-brace-presence",
  "react/jsx-filename-extension",
  "react/jsx-fragments",
  "react/jsx-handler-names",
  "react/jsx-key",
  "react/jsx-max-depth",
  "react/jsx-no-comment-textnodes",
  "react/jsx-no-constructed-context-values",
  "react/jsx-no-duplicate-props",
  "react/jsx-no-script-url",
  "react/jsx-no-target-blank",
  "react/jsx-no-undef",
  "react/jsx-no-useless-fragment",
  "react/jsx-pascal-case",
  "react/jsx-props-no-spread-multi",
  "react/jsx-props-no-spreading",
  "react/no-array-index-key",
  "react/no-children-prop",
  "react/no-clone-element",
  "react/no-danger",
  "react/no-danger-with-children",
  "react/no-did-mount-set-state",
  "react/no-did-update-set-state",
  "react/no-direct-mutation-state",
  "react/no-find-dom-node",
  "react/no-is-mounted",
  "react/no-multi-comp",
  "react/no-namespace",
  "react/no-object-type-as-default-prop",
  "react/no-react-children",
  "react/no-redundant-should-component-update",
  "react/no-render-return-value",
  "react/no-set-state",
  "react/no-string-refs",
  "react/no-this-in-sfc",
  "react/no-unescaped-entities",
  "react/no-unknown-property",
  "react/no-unsafe",
  "react/no-unstable-nested-components",
  "react/no-will-update-set-state",
  "react/only-export-components",
  "react/prefer-es6-class",
  "react/prefer-function-component",
  "react/react-in-jsx-scope",
  "react/self-closing-comp",
  "react/state-in-constructor",
  "react/style-prop-object",
  "react/void-dom-elements-no-children",
] as const

const EXPECTED_OXLINT_JSX_A11Y_RULES = [
  "jsx-a11y/alt-text",
  "jsx-a11y/anchor-ambiguous-text",
  "jsx-a11y/anchor-has-content",
  "jsx-a11y/anchor-is-valid",
  "jsx-a11y/aria-activedescendant-has-tabindex",
  "jsx-a11y/aria-props",
  "jsx-a11y/aria-proptypes",
  "jsx-a11y/aria-role",
  "jsx-a11y/aria-unsupported-elements",
  "jsx-a11y/autocomplete-valid",
  "jsx-a11y/click-events-have-key-events",
  "jsx-a11y/control-has-associated-label",
  "jsx-a11y/heading-has-content",
  "jsx-a11y/html-has-lang",
  "jsx-a11y/iframe-has-title",
  "jsx-a11y/img-redundant-alt",
  "jsx-a11y/interactive-supports-focus",
  "jsx-a11y/label-has-associated-control",
  "jsx-a11y/lang",
  "jsx-a11y/media-has-caption",
  "jsx-a11y/mouse-events-have-key-events",
  "jsx-a11y/no-access-key",
  "jsx-a11y/no-aria-hidden-on-focusable",
  "jsx-a11y/no-autofocus",
  "jsx-a11y/no-distracting-elements",
  "jsx-a11y/no-interactive-element-to-noninteractive-role",
  "jsx-a11y/no-noninteractive-element-interactions",
  "jsx-a11y/no-noninteractive-element-to-interactive-role",
  "jsx-a11y/no-noninteractive-tabindex",
  "jsx-a11y/no-redundant-roles",
  "jsx-a11y/no-static-element-interactions",
  "jsx-a11y/prefer-tag-over-role",
  "jsx-a11y/role-has-required-aria-props",
  "jsx-a11y/role-supports-aria-props",
  "jsx-a11y/scope",
  "jsx-a11y/tabindex-no-positive",
] as const

const EXPECTED_OXLINT_REACT_HOOKS_RULES = [
  "react-hooks/exhaustive-deps",
  "react-hooks/rules-of-hooks",
] as const

const EXPECTED_OXLINT_REACT_PERF_RULES = [
  "react-perf/jsx-no-jsx-as-prop",
  "react-perf/jsx-no-new-array-as-prop",
  "react-perf/jsx-no-new-function-as-prop",
  "react-perf/jsx-no-new-object-as-prop",
] as const

type CheckFailure = {
  actual?: readonly string[]
  expected?: readonly string[]
  message: string
}

const failures: CheckFailure[] = []

function sorted(values: Iterable<string>): string[] {
  return [...values].sort()
}

function getConfigRules(
  configs: Record<string, { rules?: Linter.RulesRecord }>,
  configName: string,
): string[] {
  return sorted(Object.keys(configs[configName].rules ?? {}))
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Typing the oxlint plugin's config shape
const oxlintConfigs = (oxlintPlugin as unknown as {
  configs: Record<string, Linter.Config | Linter.Config[]>
}).configs

function getOxlintRules(configName: string): string[] {
  const raw = oxlintConfigs[configName]
  return sorted([raw].flat().flatMap((config) => Object.keys(config.rules ?? {})))
}

function assertSame(
  message: string,
  actual: readonly string[],
  expected: readonly string[],
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push({ actual, expected, message })
  }
}

function assertRuleExists(message: string, rules: object, ruleName: string): void {
  if (!(ruleName in rules)) {
    failures.push({ message: `${message}: ${ruleName}` })
  }
}

function assertRuleAbsent(message: string, rules: object, ruleName: string): void {
  if (ruleName in rules) {
    failures.push({ message: `${message}: ${ruleName}` })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Typing the eslint-react config surface for drift checks
const eslintReactConfigs = eslintReactPlugin.configs as unknown as Record<
  string,
  { rules?: Linter.RulesRecord }
>

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Plugin from untyped module
const typedReactPerfPlugin = reactPerfPlugin as unknown as {
  rules: Record<string, unknown>
}
const reactPerfRules = typedReactPerfPlugin.rules

assertSame(
  "@eslint-react config surface changed; classify new/removed configs",
  sorted(Object.keys(eslintReactConfigs)),
  EXPECTED_ESLINT_REACT_CONFIGS,
)

assertSame(
  "@eslint-react react conflict config changed; review compat aliases and docs",
  getConfigRules(eslintReactConfigs, "disable-conflict-eslint-plugin-react"),
  EXPECTED_REACT_CONFLICT_RULES,
)

assertSame(
  "@eslint-react react-hooks conflict config changed; review hook namespace strategy",
  getConfigRules(eslintReactConfigs, "disable-conflict-eslint-plugin-react-hooks"),
  EXPECTED_REACT_HOOKS_CONFLICT_RULES,
)

const hookPresetRules = reactHooksPlugin.configs.flat["recommended-latest"].rules
assertSame(
  "eslint-plugin-react-hooks recommended-latest changed; review compiler rule adoption",
  sorted(Object.keys(hookPresetRules)),
  EXPECTED_REACT_HOOKS_LATEST_RULES,
)

const reactRules = reactConfig()[0]?.rules ?? {}
const aiReactRules = reactConfig({ ai: true })[0]?.rules ?? {}

for (const ruleName of AI_PROMOTED_REACT_RULES) {
  assertRuleExists("AI-promoted React rule disappeared from strict-type-checked", reactRules, ruleName)
  assertRuleExists("AI-promoted React rule is missing from AI config", aiReactRules, ruleName)
}

for (const ruleName of Object.keys(AI_ADDED_REACT_RULES)) {
  assertRuleExists("AI-added React compat rule disappeared", reactCompatPlugin.rules ?? {}, ruleName.replace("react/", ""))
  assertRuleExists("AI-added React rule is missing from AI config", aiReactRules, ruleName)
}

for (const ruleName of Object.keys(AI_REACT_PERF_RULES)) {
  assertRuleExists("AI React Perf rule disappeared from plugin", reactPerfRules, ruleName.replace("react-perf/", ""))
  assertRuleExists("AI React Perf rule is missing from AI config", aiReactRules, ruleName)
}

for (const ruleName of Object.keys(hookPresetRules)) {
  assertRuleExists("React Hooks recommended-latest rule missing from React config", reactRules, ruleName)
}

for (const shortName of REACT_HOOKS_REPLACED_ESLINT_REACT_RULES) {
  assertRuleAbsent(
    "@eslint-react hook/compiler duplicate leaked into react/* namespace",
    reactRules,
    `react/${shortName}`,
  )
}

for (const aliasName of REACT_COMPAT_LEGACY_ALIAS_NAMES) {
  assertRuleExists("React compat legacy alias has no implementation", reactCompatPlugin.rules ?? {}, aliasName)
}

assertSame(
  "OxLint flat/react coverage changed; update docs and expected surface",
  getOxlintRules("flat/react"),
  EXPECTED_OXLINT_REACT_RULES,
)
assertSame(
  "OxLint flat/jsx-a11y coverage changed; update docs and expected surface",
  getOxlintRules("flat/jsx-a11y"),
  EXPECTED_OXLINT_JSX_A11Y_RULES,
)
assertSame(
  "OxLint flat/react-hooks coverage changed; update docs and expected surface",
  getOxlintRules("flat/react-hooks"),
  EXPECTED_OXLINT_REACT_HOOKS_RULES,
)
assertSame(
  "OxLint flat/react-perf coverage changed; update docs and expected surface",
  getOxlintRules("flat/react-perf"),
  EXPECTED_OXLINT_REACT_PERF_RULES,
)

const reactOxlintBlocks = oxlintIntegration({ react: true })
  .map((config) => config.name)
  .filter((name): name is string => typeof name === "string")
assertSame(
  "React OxLint integration blocks changed unexpectedly",
  reactOxlintBlocks.filter((name) => name.includes("react")),
  [
    "eslint-config-setup/oxlint-react",
    "eslint-config-setup/oxlint-react-hooks-1",
    "eslint-config-setup/oxlint-react-hooks-2",
  ],
)

const aiReactOxlintBlocks = oxlintIntegration({ react: true, ai: true })
  .map((config) => config.name)
  .filter((name): name is string => typeof name === "string")
assertSame(
  "AI React OxLint integration must include React Perf coverage",
  aiReactOxlintBlocks.filter((name) => name.includes("react")),
  [
    "eslint-config-setup/oxlint-react",
    "eslint-config-setup/oxlint-react-hooks-1",
    "eslint-config-setup/oxlint-react-hooks-2",
    "eslint-config-setup/oxlint-react-perf",
  ],
)

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`\n${failure.message}`)
    if (failure.expected) {
      console.error("Expected:")
      console.error(JSON.stringify(failure.expected, null, 2))
    }
    if (failure.actual) {
      console.error("Actual:")
      console.error(JSON.stringify(failure.actual, null, 2))
    }
  }
  process.exitCode = 1
} else {
  console.log("React and OxLint rule surfaces match reviewed expectations.")
}
