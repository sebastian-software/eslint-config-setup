import type { Linter } from "eslint"

import eslintReactPlugin from "@eslint-react/eslint-plugin"
import stylisticPlugin from "@stylistic/eslint-plugin"
// @ts-expect-error -- no type declarations available
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import reactHooksPlugin from "eslint-plugin-react-hooks"
// @ts-expect-error -- no type declarations available
import reactPerfPlugin from "eslint-plugin-react-perf"
import reactRefreshPlugin from "eslint-plugin-react-refresh"
import globals from "globals"

import type { FlatConfigArray } from "../types"

import { createConfig } from "../build/config-builder"
import {
  MARKDOWN_CODE_BLOCK_FILES,
  TYPESCRIPT_SOURCE_FILES,
} from "../file-patterns"
import {
  reactCompatPlugin,
  translatePresetRules,
} from "../plugins/react-compat"

type Builder = ReturnType<typeof createConfig>

// ── Derive react/ rules from @eslint-react presets ──────────────────────────
// strict-type-checked is translated to react/ compat names. Hook/compiler rules
// are intentionally supplied by eslint-plugin-react-hooks under react-hooks/*.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Typing the eslint-react configs shape
const typedConfigs = eslintReactPlugin.configs as unknown as Record<
  string,
  { rules: Linter.RulesRecord }
>
const strictTypeCheckedRules = typedConfigs["strict-type-checked"].rules

export const REACT_HOOKS_REPLACED_ESLINT_REACT_RULES = [
  "error-boundaries",
  "exhaustive-deps",
  "purity",
  "rules-of-hooks",
  "set-state-in-effect",
  "set-state-in-render",
  "static-components",
  "unsupported-syntax",
  "use-memo",
] as const

const reactHooksReplacedRules = new Set<string>(
  REACT_HOOKS_REPLACED_ESLINT_REACT_RULES,
)

function filterReactHooksRules(rules: Linter.RulesRecord): Linter.RulesRecord {
  const filtered: Linter.RulesRecord = {}

  for (const [ruleName, value] of Object.entries(rules)) {
    const shortName = ruleName.replace(/^@eslint-react\//, "")
    if (!reactHooksReplacedRules.has(shortName)) {
      filtered[ruleName] = value
    }
  }

  return filtered
}

const presetRules = translatePresetRules(filterReactHooksRules(strictTypeCheckedRules))

/**
 * `@eslint-react` rules that need type information, in `react/` compat names.
 * Derived from the upstream `disable-type-checked` config, which is the
 * authoritative list (these rules carry no `requiresTypeChecking` marker).
 */
const disableTypeCheckedRules = typedConfigs["disable-type-checked"].rules

export const REACT_TYPE_AWARE_RULES: ReadonlySet<string> = new Set(
  Object.keys(translatePresetRules(disableTypeCheckedRules)),
)

if (REACT_TYPE_AWARE_RULES.size !== Object.keys(disableTypeCheckedRules).length) {
  throw new Error(
    `@eslint-react disable-type-checked has ${Object.keys(disableTypeCheckedRules).length} rules, ` +
      `but only ${REACT_TYPE_AWARE_RULES.size} map to react/ compat names. ` +
      `Review the compat mapping in plugins/react-compat.ts.`,
  )
}

function getPresetRule(ruleName: string): Linter.RuleEntry {
  if (!(ruleName in presetRules)) {
    throw new Error(
      `React preset rule "${ruleName}" not found in strict-type-checked. ` +
        `Review the type-aware rule scoping in react.ts.`,
    )
  }
  return presetRules[ruleName]
}

// Type-aware preset rules, scoped to TypeScript sources (see addReactFileOverrides).
const TYPE_AWARE_PRESET_RULE_NAMES = [
  "react/no-unused-props",
  "react/jsx-no-leaked-render",
] as const

const TYPE_AWARE_PRESET_RULES: Linter.RulesRecord = Object.fromEntries(
  TYPE_AWARE_PRESET_RULE_NAMES.map((ruleName) => [ruleName, getPresetRule(ruleName)]),
)

const reactHooksRecommendedLatest = reactHooksPlugin.configs.flat[
  "recommended-latest"
] as Linter.Config
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The plugin ships flat config metadata outside ESLint's Plugin type.
const reactHooksPluginForEslint = reactHooksPlugin as unknown as Record<string, unknown>

const EXTRA_REACT_RULES = {
  "react/no-duplicate-key": "error",
  "react/no-unknown-property": "error",
  "react/style-prop-object": "error",
} satisfies Linter.RulesRecord

export const AI_ADDED_REACT_RULES = {
  "react/no-unused-state": "error",
} satisfies Linter.RulesRecord

export const AI_REACT_PERF_RULES = {
  "react-perf/jsx-no-jsx-as-prop": "error",
  "react-perf/jsx-no-new-array-as-prop": "error",
  "react-perf/jsx-no-new-function-as-prop": "error",
  "react-perf/jsx-no-new-object-as-prop": "error",
} satisfies Linter.RulesRecord

const JSX_A11Y_ERROR_RULES = {
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/anchor-is-valid": "error",
  "jsx-a11y/aria-activedescendant-has-tabindex": "error",
  "jsx-a11y/aria-props": "error",
  "jsx-a11y/aria-proptypes": "error",
  "jsx-a11y/aria-role": "error",
  "jsx-a11y/aria-unsupported-elements": "error",
  "jsx-a11y/click-events-have-key-events": "error",
  "jsx-a11y/heading-has-content": "error",
  "jsx-a11y/html-has-lang": "error",
  "jsx-a11y/img-redundant-alt": "error",
  "jsx-a11y/label-has-associated-control": "error",
  "jsx-a11y/mouse-events-have-key-events": "error",
  "jsx-a11y/no-access-key": "error",
  "jsx-a11y/no-distracting-elements": "error",
  "jsx-a11y/no-redundant-roles": "error",
  "jsx-a11y/role-has-required-aria-props": "error",
  "jsx-a11y/role-supports-aria-props": "error",
  "jsx-a11y/scope": "error",
  "jsx-a11y/tabindex-no-positive": "error",
  "jsx-a11y/lang": "error",
  "jsx-a11y/autocomplete-valid": "error",
} satisfies Linter.RulesRecord

export const AI_PROMOTED_REACT_RULES = [
  "react/jsx-no-comment-textnodes",
  "react/jsx-no-useless-fragment",
  "react/jsx-no-constructed-context-values",
  "react/no-array-index-key",
  "react/no-object-type-as-default-prop",
  "react/jsx-no-target-blank",
  "react/button-has-type",
  "react/iframe-missing-sandbox",
  "react/forward-ref-uses-ref",
  "react/no-context-provider",
  "react/no-use-context",
  "react/no-leaked-event-listener",
  "react/no-leaked-interval",
  "react/no-leaked-timeout",
  "react/no-leaked-resize-observer",
] as const

const AI_A11Y_RULES = [
  "jsx-a11y/no-static-element-interactions",
  "jsx-a11y/no-noninteractive-element-interactions",
  "jsx-a11y/interactive-supports-focus",
] as const

function addRules(builder: Builder, rules: Linter.RulesRecord): void {
  for (const [ruleName, value] of Object.entries(rules)) {
    builder.addRule(ruleName, value)
  }
}

function addExtraReactRules(builder: Builder): void {
  addRules(builder, EXTRA_REACT_RULES)
}

function addStylisticReactRules(builder: Builder): void {
  builder.addRule("@stylistic/jsx-self-closing-comp", "error")
  builder.addRule("@stylistic/jsx-curly-brace-presence", [
    "error",
    { props: "never", children: "never" },
  ])
}

function addReactRefreshRules(builder: Builder): void {
  builder.addRule("react-refresh/only-export-components", [
    "warn",
    { allowConstantExport: true },
  ])
}

function addAccessibilityRules(builder: Builder): void {
  addRules(builder, JSX_A11Y_ERROR_RULES)
  builder.addRule("jsx-a11y/no-autofocus", ["error", { ignoreNonDOM: true }])
}

function applyAiReactRules(builder: Builder): void {
  for (const ruleName of AI_PROMOTED_REACT_RULES) {
    builder.overrideSeverity(ruleName, "error")
  }

  addRules(builder, AI_ADDED_REACT_RULES)
  addRules(builder, AI_REACT_PERF_RULES)

  for (const ruleName of AI_A11Y_RULES) {
    builder.addRule(ruleName, "error")
  }
}

function removeTypeAwarePresetRules(builder: Builder): void {
  for (const ruleName of TYPE_AWARE_PRESET_RULE_NAMES) {
    builder.removeRule(ruleName)
  }
}

function addReactFileOverrides(builder: Builder): void {
  // Type-aware rules live here, not in the main block: Markdown code blocks are
  // linted without type information (projectService: false), so these rules
  // must be scoped to TypeScript sources and exclude code blocks. AI-mode
  // promotions of these rules must target this override, because removeRule
  // drops them from the main block.
  builder.addFileOverride(
    "eslint-config-setup/react-typescript",
    [...TYPESCRIPT_SOURCE_FILES],
    {
      // Allow async event handlers — onClick={async () => {...}} is idiomatic React
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      "react/no-implicit-key": "error",
      ...TYPE_AWARE_PRESET_RULES,
    },
    [...MARKDOWN_CODE_BLOCK_FILES],
  )
}

function assertNoTypeAwareRulesInMainBlock(config: FlatConfigArray): void {
  const mainBlock = config.find((block) => block.name === "eslint-config-setup/react")
  if (!mainBlock) {
    throw new Error("React config main block \"eslint-config-setup/react\" not found.")
  }
  const leaked = Object.keys(mainBlock.rules ?? {}).filter((ruleName) =>
    REACT_TYPE_AWARE_RULES.has(ruleName),
  )
  if (leaked.length > 0) {
    throw new Error(
      `Type-aware React rules must be scoped to the react-typescript override: ${leaked.join(", ")}`,
    )
  }
}

/**
 * React config — React 19+, Hooks, JSX accessibility, and Web API leak detection.
 *
 * Uses `@eslint-react` (eslint-plugin-react-x) for React, DOM, Web API,
 * naming-convention, and RSC rules under the `react/` compat namespace.
 * Rules of Hooks and React Compiler linting come from Meta's
 * eslint-plugin-react-hooks under the native `react-hooks/` namespace.
 *
 * Base React severities come from the `@eslint-react` `strict-type-checked` preset.
 * When `ai: true`, preset "warn" rules that AI should always get right are
 * promoted to "error", and React performance rules are enabled as errors.
 *
 * @see https://eslint-react.xyz/docs/rules/overview
 * @see https://www.npmjs.com/package/eslint-plugin-react-hooks
 * @see https://github.com/cvazac/eslint-plugin-react-perf
 * @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
 * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#supported-rules
 */
export function reactConfig(opts?: { ai?: boolean }): FlatConfigArray {
  const isAi = opts?.ai ?? false

  const builder = createConfig({
    name: "eslint-config-setup/react",
    presets: [{ rules: presetRules }, reactHooksRecommendedLatest],
    plugins: {
      react: reactCompatPlugin,
      "@stylistic": stylisticPlugin,
      "react-hooks": reactHooksPluginForEslint,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Plugin from untyped module
      "react-perf": reactPerfPlugin as Record<string, unknown>,
      "react-refresh": reactRefreshPlugin,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Plugin from untyped module
      "jsx-a11y": jsxA11yPlugin as Record<string, unknown>,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  })

  removeTypeAwarePresetRules(builder)
  addExtraReactRules(builder)
  addStylisticReactRules(builder)
  addReactRefreshRules(builder)
  addAccessibilityRules(builder)

  // ── AI mode: promote preset "warn" rules to "error" ───────────────
  // These rules catch real bugs or patterns AI should always avoid.
  // overrideSeverity validates that the rule exists in the preset —
  // if a future @eslint-react version removes one, we get a build error.
  if (isAi) {
    applyAiReactRules(builder)
  }

  addReactFileOverrides(builder)

  const config = builder.build()
  assertNoTypeAwareRulesInMainBlock(config)
  return config
}
