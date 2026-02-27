import tseslint from "typescript-eslint"

import { createConfig } from "../build/config-builder.ts"
import type { ConfigOptions, FlatConfig, FlatConfigArray } from "../types.ts"

/**
 * TypeScript config — extends typescript-eslint presets with project-wide type checking.
 *
 * Presets used (depending on strict flag):
 * - strict:  `tseslint.configs.strictTypeChecked` — all recommended + strict rules with type info
 * - default: `tseslint.configs.recommendedTypeChecked` — recommended rules with type info
 * - always:  `tseslint.configs.stylisticTypeChecked` — consistent code style with type info
 *
 * The presets already handle many core ESLint rules by disabling them and enabling
 * TS-aware equivalents (no-implied-eval, dot-notation, no-throw-literal, etc.).
 *
 * @see https://typescript-eslint.io/getting-started/
 * @see https://typescript-eslint.io/rules/
 */
export function typescriptConfig(opts: ConfigOptions): FlatConfigArray {
  const typeChecked = opts.strict
    ? tseslint.configs.strictTypeChecked
    : tseslint.configs.recommendedTypeChecked

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

  // ── Rules that differ between strict and recommended presets ───
  // strictTypeChecked includes return-await and no-deprecated;
  // recommendedTypeChecked does not.

  if (opts.strict) {
    // Override return-await from "error-handling-correctness-only" to "in-try-catch"
    // https://typescript-eslint.io/rules/return-await
    builder.overrideRule("@typescript-eslint/return-await", [
      "error",
      "in-try-catch",
    ])

    // Downgrade from error to warn — stay current but don't block
    // https://typescript-eslint.io/rules/no-deprecated
    builder.overrideRule("@typescript-eslint/no-deprecated", "warn")
  } else {
    // Require `return await` in try/catch — correct error stack traces
    // https://typescript-eslint.io/rules/return-await
    builder.addRule("no-return-await", "off")
    builder.addRule("@typescript-eslint/return-await", [
      "error",
      "in-try-catch",
    ])

    // Flag usage of deprecated APIs — stay current with library updates
    // Uses type information to detect @deprecated annotations.
    // https://typescript-eslint.io/rules/no-deprecated
    builder.addRule("@typescript-eslint/no-deprecated", "warn")
  }

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
