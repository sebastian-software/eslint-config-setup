import tseslint from "typescript-eslint"

import { createConfig } from "../build/config-builder"
import type { FlatConfig, FlatConfigArray } from "../types"

/**
 * TypeScript config — extends typescript-eslint strict presets with project-wide type checking.
 *
 * Presets used:
 * - `tseslint.configs.strictTypeChecked` — all recommended + strict rules with type info
 * - `tseslint.configs.stylisticTypeChecked` — consistent code style with type info
 *
 * The presets already handle many core ESLint rules by disabling them and enabling
 * TS-aware equivalents (no-implied-eval, dot-notation, no-throw-literal, etc.).
 *
 * @see https://typescript-eslint.io/getting-started/
 * @see https://typescript-eslint.io/rules/
 */
export function typescriptConfig(): FlatConfigArray {
  const typeChecked = tseslint.configs.strictTypeChecked
  const stylistic = tseslint.configs.stylisticTypeChecked

  // Blocks 0+1: parser setup + ESLint-core replacements (structural, not validated)
  // Block 2 from each: the actual @typescript-eslint/* rules (validated)
  const structuralBlocks = typeChecked.slice(0, 2) as FlatConfigArray
  const ruleBlocks = [typeChecked[2], stylistic[2]] as FlatConfig[]

  const builder = createConfig({
    name: "@effective/eslint/typescript",
    passthrough: structuralBlocks,
    presets: ruleBlocks,
    languageOptions: {
      parserOptions: {
        // Use project service for automatic tsconfig resolution
        // https://typescript-eslint.io/packages/parser#projectservice
        projectService: true,
      },
    },
  })

  // ── Override preset defaults ──────────────────────────────────

  // Override bare `error` with underscore-ignore pattern — universal convention
  // Preset sets bare `error` with no options (no ignoreRestSiblings, no _ pattern)
  // https://typescript-eslint.io/rules/no-unused-vars
  builder.overrideRule("@typescript-eslint/no-unused-vars", [
    "error",
    {
      args: "all",
      argsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ])

  // Enforce T[] for simple types, Array<T> for complex — readable array types
  // (in stylisticTypeChecked preset as bare "error", we add options)
  // https://typescript-eslint.io/rules/array-type
  builder.overrideRule("@typescript-eslint/array-type", [
    "error",
    { default: "array-simple" },
  ])

  // Override return-await from "error-handling-correctness-only" to "in-try-catch"
  // https://typescript-eslint.io/rules/return-await
  builder.overrideRule("@typescript-eslint/return-await", [
    "error",
    "in-try-catch",
  ])

  // Downgrade from error to warn — stay current but don't block
  // https://typescript-eslint.io/rules/no-deprecated
  builder.overrideRule("@typescript-eslint/no-deprecated", "warn")

  // ── Beyond presets: import/export hygiene ──────────────────

  // Enforce `import type { T }` — ensures types are erased at compile time
  // https://typescript-eslint.io/rules/consistent-type-imports
  builder.addRule("@typescript-eslint/consistent-type-imports", [
    "error",
    { fixStyle: "inline-type-imports" },
  ])

  // Enforce `export type { T }` — matches import convention
  // https://typescript-eslint.io/rules/consistent-type-exports
  builder.addRule("@typescript-eslint/consistent-type-exports", [
    "error",
    { fixMixedExportsWithInlineTypeSpecifier: true },
  ])

  // Prevent type-only imports from triggering side effects
  // https://typescript-eslint.io/rules/no-import-type-side-effects
  builder.addRule("@typescript-eslint/no-import-type-side-effects", "error")

  // Remove unnecessary namespace qualifiers — cleaner code
  // https://typescript-eslint.io/rules/no-unnecessary-qualifier
  builder.addRule("@typescript-eslint/no-unnecessary-qualifier", "error")

  // Remove useless `export {}` — keeps module boundaries clean
  // https://typescript-eslint.io/rules/no-useless-empty-export
  builder.addRule("@typescript-eslint/no-useless-empty-export", "error")

  // Detect redundant `this.x = x` after constructor parameter property
  // https://typescript-eslint.io/rules/no-unnecessary-parameter-property-assignment
  builder.addRule(
    "@typescript-eslint/no-unnecessary-parameter-property-assignment",
    "error",
  )

  // Void-returning callbacks must not accidentally return values
  // Catches: `forEach(x => map.set(x, 1))` — .set() returns the map, but forEach expects void
  // https://typescript-eslint.io/rules/strict-void-return
  builder.addRule("@typescript-eslint/strict-void-return", "error")

  // ── Beyond presets: safety & correctness ──────────────────────

  // Prevent variable shadowing — catches bugs where inner var hides outer
  // Not in any preset. TS-aware version avoids false positives with type/value merging.
  // https://typescript-eslint.io/rules/no-shadow
  builder.addRule("no-shadow", "off")
  builder.addRule("@typescript-eslint/no-shadow", [
    "error",
    {
      hoist: "all",
      allow: ["resolve", "reject", "done", "next", "error"],
      ignoreTypeValueShadow: true,
      ignoreFunctionTypeParameterNameValueShadow: true,
    },
  ])

  // Require strict boolean expressions — no implicit truthiness checks
  // Prevents bugs like `if (count)` when count is 0 (falsy but valid)
  // https://typescript-eslint.io/rules/strict-boolean-expressions
  builder.addRule("@typescript-eslint/strict-boolean-expressions", [
    "error",
    { allowNullableBoolean: true, allowNullableObject: true },
  ])

  // ── File overrides ────────────────────────────────────────────

  // Disable type-checked rules for plain JS files (no tsconfig coverage)
  // https://typescript-eslint.io/users/configs#disable-type-checked
  builder.addFileOverride(
    "@effective/eslint/typescript-js-compat",
    ["**/*.{js,mjs,cjs}"],
    tseslint.configs.disableTypeChecked.rules ?? {},
  )

  return builder.build()
}
