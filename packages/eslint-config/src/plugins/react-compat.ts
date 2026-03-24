/**
 * React Compat Plugin — merges all `@eslint-react` sub-plugins into a single
 * `react` namespace and re-exports rules under legacy `eslint-plugin-react`
 * names where a 1:1 equivalent exists.
 *
 * **Why?** OxLint implements many React rules under the classic `react/` prefix
 * with legacy names (e.g. `react/jsx-key`, `react/no-danger`). By registering
 * the modern `@eslint-react` rule implementations under those legacy names, we
 * get automatic OxLint coverage — OxLint runs the fast Rust check and ESLint
 * skips the JS version via `eslint-plugin-oxlint`'s `flat/react` config.
 *
 * Rules without a legacy equivalent keep their `@eslint-react` short name
 * (e.g. `react/no-context-provider`, `react/no-leaked-event-listener`).
 * As OxLint expands React support, more rules will automatically be covered.
 *
 * @see https://eslint-react.xyz/docs/rules/overview
 * @see https://oxc.rs/docs/guide/usage/linter/rules.html
 */
import eslintReactPlugin from "@eslint-react/eslint-plugin"

import type { ESLint, Rule } from "eslint"

type PluginRules = Record<string, Rule.RuleModule>

/**
 * Extracts a sub-plugin's rules object from an @eslint-react config entry.
 */
function extractSubPluginRules(
  configName: string,
  pluginKey: string,
): PluginRules {
  const configs = eslintReactPlugin.configs as Record<string, Record<string, unknown>>
  const config = configs[configName]
  const plugins = config.plugins as Record<string, { rules: PluginRules }>
  return plugins[pluginKey].rules
}

const coreRules = eslintReactPlugin.rules as PluginRules
const domRules = extractSubPluginRules("dom", "@eslint-react/dom")
const webApiRules = extractSubPluginRules("web-api", "@eslint-react/web-api")
const namingRules = extractSubPluginRules(
  "recommended",
  "@eslint-react/naming-convention",
)
const rscRules = extractSubPluginRules("rsc", "@eslint-react/rsc")

// ── Legacy name mapping ─────────────────────────────────────────────────────
// Maps legacy eslint-plugin-react name → { source rules object, original name }
// Based on @eslint-react's `disable-conflict-eslint-plugin-react` config.
// Only 1:1 mappings are included — 1:many (e.g. `no-unsafe` → 3 rules) are skipped.

const LEGACY_ALIASES: Record<string, [source: PluginRules, originalName: string]> =
  {
    // ── Core: identical names ──────────────────────────────────────────
    "no-access-state-in-setstate": [coreRules, "no-access-state-in-setstate"],
    "no-array-index-key": [coreRules, "no-array-index-key"],
    "no-children-prop": [coreRules, "no-children-prop"],
    "no-direct-mutation-state": [coreRules, "no-direct-mutation-state"],
    "no-redundant-should-component-update": [
      coreRules,
      "no-redundant-should-component-update",
    ],
    "no-unused-class-component-members": [
      coreRules,
      "no-unused-class-component-members",
    ],
    "no-unused-state": [coreRules, "no-unused-state"],
    "jsx-no-comment-textnodes": [coreRules, "jsx-no-comment-textnodes"],

    // ── Core: renamed 1:1 ──────────────────────────────────────────────
    "jsx-boolean-value": [coreRules, "jsx-shorthand-boolean"],
    "jsx-fragments": [coreRules, "jsx-shorthand-fragment"],
    "jsx-key": [coreRules, "no-missing-key"],
    "jsx-no-constructed-context-values": [
      coreRules,
      "no-unstable-context-value",
    ],
    "jsx-no-leaked-render": [coreRules, "no-leaked-conditional-rendering"],
    "jsx-no-useless-fragment": [coreRules, "no-useless-fragment"],
    "no-object-type-as-default-prop": [coreRules, "no-unstable-default-props"],
    "no-unstable-nested-components": [
      coreRules,
      "no-nested-component-definitions",
    ],
    "display-name": [coreRules, "no-missing-component-display-name"],
    "forward-ref-uses-ref": [coreRules, "no-forward-ref"],
    "destructuring-assignment": [coreRules, "prefer-destructuring-assignment"],
    "no-did-mount-set-state": [
      coreRules,
      "no-set-state-in-component-did-mount",
    ],
    "no-did-update-set-state": [
      coreRules,
      "no-set-state-in-component-did-update",
    ],
    "no-will-update-set-state": [
      coreRules,
      "no-set-state-in-component-will-update",
    ],

    // ── Naming convention → legacy names ───────────────────────────────
    "hook-use-state": [coreRules, "use-state"],

    // ── DOM → legacy react/ names (not react-dom/) ─────────────────────
    "no-danger": [domRules, "no-dangerously-set-innerhtml"],
    "no-danger-with-children": [
      domRules,
      "no-dangerously-set-innerhtml-with-children",
    ],
    "no-find-dom-node": [domRules, "no-find-dom-node"],
    "no-namespace": [domRules, "no-namespace"],
    "no-render-return-value": [domRules, "no-render-return-value"],
    "jsx-no-script-url": [domRules, "no-script-url"],
    "jsx-no-target-blank": [domRules, "no-unsafe-target-blank"],
    "no-unknown-property": [domRules, "no-unknown-property"],
    "void-dom-elements-no-children": [
      domRules,
      "no-void-elements-with-children",
    ],
    "button-has-type": [domRules, "no-missing-button-type"],
    "iframe-missing-sandbox": [domRules, "no-missing-iframe-sandbox"],
    "style-prop-object": [domRules, "no-string-style-prop"],
  }

// Build the set of original rule names that are aliased to a legacy name.
// These will NOT be included under their original name to avoid duplicates.
const aliasedOriginals = new Set<string>()
for (const [source, originalName] of Object.values(LEGACY_ALIASES)) {
  if (source === coreRules) {
    aliasedOriginals.add(originalName)
  }
}

// ── Merge all rules ─────────────────────────────────────────────────────────
const mergedRules: PluginRules = {}

// 1. Core rules — skip those that have a legacy alias
for (const [name, rule] of Object.entries(coreRules)) {
  if (!aliasedOriginals.has(name)) {
    mergedRules[name] = rule
  }
}

// 2. Sub-plugin rules — use short name (strip sub-plugin prefix).
//    Skip `prefer-namespace-import` from dom (collides with core).
const subPlugins: Array<[PluginRules, Set<string>]> = [
  [domRules, new Set(["prefer-namespace-import"])],
  [webApiRules, new Set()],
  [namingRules, new Set()],
  [rscRules, new Set()],
]

for (const [rules, skip] of subPlugins) {
  for (const [name, rule] of Object.entries(rules)) {
    if (skip.has(name)) continue
    // Skip sub-plugin rules that are aliased to a legacy name
    const isAliased = Object.values(LEGACY_ALIASES).some(
      ([source, originalName]) => source === rules && originalName === name,
    )
    if (!isAliased) {
      mergedRules[name] = rule
    }
  }
}

// 3. Legacy aliases — register under legacy name pointing to the implementation
for (const [legacyName, [source, originalName]] of Object.entries(
  LEGACY_ALIASES,
)) {
  mergedRules[legacyName] = source[originalName]
}

// ── Reverse map: original name → compat name ────────────────────────────────
// Used by translatePresetRules to convert @eslint-react preset keys to react/ keys.
const originalToCompat = new Map<string, string>()
for (const [legacyName, [, originalName]] of Object.entries(LEGACY_ALIASES)) {
  originalToCompat.set(originalName, legacyName)
}

/**
 * Translates rules from an `@eslint-react` preset (e.g. `recommended`, `strict`)
 * into `react/` compat names that match our unified plugin namespace.
 *
 * Example: `"@eslint-react/no-missing-key": "error"` → `"react/jsx-key": "error"`
 */
export function translatePresetRules(
  presetRules: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(presetRules)) {
    // Strip plugin prefix: @eslint-react/dom/X → X, @eslint-react/X → X
    const shortName = key
      .replace(
        /^@eslint-react\/(?:dom|web-api|naming-convention|rsc)\//,
        "",
      )
      .replace(/^@eslint-react\//, "")

    const compatName = originalToCompat.get(shortName) ?? shortName
    if (compatName in mergedRules) {
      result[`react/${compatName}`] = value
    }
  }

  return result
}

/**
 * Unified React plugin registered as `react` in ESLint flat config.
 * Contains all @eslint-react rule implementations under OxLint-compatible names.
 */
export const reactCompatPlugin: ESLint.Plugin = {
  meta: {
    name: "react-compat",
    version: "1.0.0",
  },
  rules: mergedRules,
}
