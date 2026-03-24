import eslintReactPlugin from "@eslint-react/eslint-plugin"
import stylisticPlugin from "@stylistic/eslint-plugin"
// @ts-expect-error -- no type declarations available
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import reactRefreshPlugin from "eslint-plugin-react-refresh"
import globals from "globals"

import { createConfig } from "../build/config-builder"
import {
  MARKDOWN_CODE_BLOCK_FILES,
  TYPESCRIPT_SOURCE_FILES,
} from "../file-patterns"
import {
  reactCompatPlugin,
  translatePresetRules,
} from "../plugins/react-compat"
import type { FlatConfigArray } from "../types"

// ── Derive react/ rules from @eslint-react presets ──────────────────────────
// Recommended + strict presets are merged and translated to react/ compat names.
// This way new rules added to the presets are picked up automatically.
const recommendedRules = (
  eslintReactPlugin.configs as Record<string, Record<string, unknown>>
).recommended.rules as Record<string, unknown>
const strictRules = (
  eslintReactPlugin.configs as Record<string, Record<string, unknown>>
).strict.rules as Record<string, unknown>
const presetRules = translatePresetRules({ ...recommendedRules, ...strictRules })

/**
 * React config — React 19+, Hooks, JSX accessibility, and Web API leak detection.
 *
 * Uses `@eslint-react` (eslint-plugin-react-x) as the primary React linting plugin,
 * replacing the unmaintained eslint-plugin-react. All rules — including DOM, Web API,
 * naming-convention, and RSC sub-plugins — are registered under a single `react/`
 * namespace via the react-compat plugin for maximum OxLint compatibility.
 *
 * Base rule severities come from the `recommended` + `strict` presets via
 * `createConfig`. When `ai: true`, preset "warn" rules that AI should always
 * get right are promoted to "error" — validated at build time.
 *
 * @see https://eslint-react.xyz/docs/rules/overview
 * @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
 * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#supported-rules
 */
export function reactConfig(opts?: { ai?: boolean }): FlatConfigArray {
  const isAi = opts?.ai ?? false

  const builder = createConfig({
    name: "eslint-config-setup/react",
    presets: [{ rules: presetRules }],
    plugins: {
      react: reactCompatPlugin,
      "@stylistic": stylisticPlugin,
      "react-refresh": reactRefreshPlugin,
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

  // ── Extra rules (not in recommended/strict presets) ────────────────

  // Prefer <Foo active /> over <Foo active={true} />
  builder.addRule("react/jsx-boolean-value", "error")
  // Prevent `{count && <Foo />}` — renders "0" when count is 0
  builder.addRule("react/jsx-no-leaked-render", "error")
  // Prevent duplicate key props in iterators
  builder.addRule("react/no-duplicate-key", "error")
  // Detect implicit keys from array position — fragile reconciliation
  builder.addRule("react/no-implicit-key", "error")
  // Detect unused props — dead code
  builder.addRule("react/no-unused-props", "warn")
  // Prevent unknown DOM properties (e.g., class → className)
  builder.addRule("react/no-unknown-property", "error")
  // Prevent `style="color: red"` — must be an object in React
  builder.addRule("react/style-prop-object", "error")

  // ── @stylistic — JSX formatting rules ─────────────────────────────

  // Enforce self-closing tags for components without children — <Foo />
  builder.addRule("@stylistic/jsx-self-closing-comp", "error")
  // Prevent unnecessary string curly braces: title={"foo"} → title="foo"
  builder.addRule("@stylistic/jsx-curly-brace-presence", [
    "error",
    { props: "never", children: "never" },
  ])

  // ── React Refresh (Fast Refresh / HMR) ────────────────────────────

  // Ensure components are exported in a way that supports Fast Refresh.
  builder.addRule("react-refresh/only-export-components", [
    "warn",
    { allowConstantExport: true },
  ])

  // ── JSX Accessibility (a11y) ──────────────────────────────────────

  builder.addRule("jsx-a11y/alt-text", "error")
  builder.addRule("jsx-a11y/anchor-has-content", "error")
  builder.addRule("jsx-a11y/anchor-is-valid", "error")
  builder.addRule("jsx-a11y/aria-activedescendant-has-tabindex", "error")
  builder.addRule("jsx-a11y/aria-props", "error")
  builder.addRule("jsx-a11y/aria-proptypes", "error")
  builder.addRule("jsx-a11y/aria-role", "error")
  builder.addRule("jsx-a11y/aria-unsupported-elements", "error")
  builder.addRule("jsx-a11y/click-events-have-key-events", "error")
  builder.addRule("jsx-a11y/heading-has-content", "error")
  builder.addRule("jsx-a11y/html-has-lang", "error")
  builder.addRule("jsx-a11y/img-redundant-alt", "error")
  builder.addRule("jsx-a11y/label-has-associated-control", "error")
  builder.addRule("jsx-a11y/mouse-events-have-key-events", "error")
  builder.addRule("jsx-a11y/no-access-key", "error")
  builder.addRule("jsx-a11y/no-autofocus", ["error", { ignoreNonDOM: true }])
  builder.addRule("jsx-a11y/no-distracting-elements", "error")
  builder.addRule("jsx-a11y/no-redundant-roles", "error")
  builder.addRule("jsx-a11y/role-has-required-aria-props", "error")
  builder.addRule("jsx-a11y/role-supports-aria-props", "error")
  builder.addRule("jsx-a11y/scope", "error")
  builder.addRule("jsx-a11y/tabindex-no-positive", "error")
  builder.addRule("jsx-a11y/lang", "error")
  builder.addRule("jsx-a11y/autocomplete-valid", "error")

  // ── AI mode: promote preset "warn" rules to "error" ───────────────
  // These rules catch real bugs or patterns AI should always avoid.
  // overrideSeverity validates that the rule exists in the preset —
  // if a future @eslint-react version removes one, we get a build error.
  if (isAi) {
    // Bug prevention
    builder.overrideSeverity("react/jsx-no-comment-textnodes", "error")
    builder.overrideSeverity("react/jsx-no-useless-fragment", "error")
    builder.overrideSeverity("react/jsx-no-constructed-context-values", "error")
    builder.overrideSeverity("react/no-array-index-key", "error")
    builder.overrideSeverity("react/no-object-type-as-default-prop", "error")
    builder.overrideSeverity("react/no-unused-state", "error")

    // Security / DOM correctness
    builder.overrideSeverity("react/jsx-no-target-blank", "error")
    builder.overrideSeverity("react/button-has-type", "error")
    builder.overrideSeverity("react/iframe-missing-sandbox", "error")

    // React 19 patterns — AI should always use modern APIs
    builder.overrideSeverity("react/forward-ref-uses-ref", "error")
    builder.overrideSeverity("react/no-context-provider", "error")
    builder.overrideSeverity("react/no-use-context", "error")

    // Web API leak prevention
    builder.overrideSeverity("react/no-leaked-event-listener", "error")
    builder.overrideSeverity("react/no-leaked-interval", "error")
    builder.overrideSeverity("react/no-leaked-timeout", "error")
    builder.overrideSeverity("react/no-leaked-resize-observer", "error")

    // Accessibility — AI should generate semantic HTML
    builder.addRule("jsx-a11y/no-static-element-interactions", "error")
    builder.addRule("jsx-a11y/no-noninteractive-element-interactions", "error")
    builder.addRule("jsx-a11y/interactive-supports-focus", "error")
  }

  // ── File-scoped overrides ─────────────────────────────────────────

  builder.addFileOverride(
    "eslint-config-setup/react-typescript",
    [...TYPESCRIPT_SOURCE_FILES],
    {
      // Allow async event handlers — onClick={async () => {...}} is idiomatic React
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
    },
  )

  return builder.build()
}
