/* eslint-disable max-lines-per-function, max-statements -- Rule definition file: sequential builder calls that configure the TypeScript preset. */
import tseslint from "typescript-eslint"

import type { FlatConfig, FlatConfigArray } from "../types"

import { createConfig } from "../build/config-builder"
import { MARKDOWN_CODE_BLOCK_FILES, TYPESCRIPT_SOURCE_FILES } from "../file-patterns"

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
export function typescriptConfig(opts?: { ai?: boolean; react?: boolean }): FlatConfigArray {
  const isAi = opts?.ai ?? false
  const isReact = opts?.react ?? false

  const typeChecked = tseslint.configs.strictTypeChecked
  const stylistic = tseslint.configs.stylisticTypeChecked

  // Blocks 0+1: parser setup + ESLint-core replacements (structural, not validated)
  // Block 2 from each: the actual @typescript-eslint/* rules (validated)
  const structuralBlocks = typeChecked.slice(0, 2) as FlatConfigArray
  const ruleBlocks = [typeChecked[2], stylistic[2]] as FlatConfig[]

  const builder = createConfig({
    name: "eslint-config-setup/typescript",
    passthrough: structuralBlocks,
    presets: ruleBlocks,
    files: [...TYPESCRIPT_SOURCE_FILES],
    ignores: [...MARKDOWN_CODE_BLOCK_FILES],
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
  builder.overrideSeverity("@typescript-eslint/no-deprecated", "warn")

  // Downgrade from error to warn — nudge towards unknown, don't block
  // https://typescript-eslint.io/rules/no-explicit-any
  builder.overrideRule("@typescript-eslint/no-explicit-any", [
    "warn",
    { fixToUnknown: true },
  ])

  // Enforce `type` over `interface` — consistent, prevents accidental declaration merging
  // https://typescript-eslint.io/rules/consistent-type-definitions
  builder.overrideRule("@typescript-eslint/consistent-type-definitions", [
    "error",
    "type",
  ])

  // Require description for @ts-expect-error — document why you override the compiler
  // https://typescript-eslint.io/rules/ban-ts-comment
  builder.overrideOptions("@typescript-eslint/ban-ts-comment", {
    "ts-expect-error": "allow-with-description",
  })

  // Catch unhandled thenables (not just Promises) and allow async IIFEs
  // https://typescript-eslint.io/rules/no-floating-promises
  builder.overrideOptions("@typescript-eslint/no-floating-promises", {
    checkThenables: true,
    ignoreIIFE: true,
  })

  // ── Beyond presets: import/export hygiene ──────────────────

  // Enforce `import type { T }` — separate type imports for clarity
  // https://typescript-eslint.io/rules/consistent-type-imports
  builder.addRule("@typescript-eslint/consistent-type-imports", [
    "error",
    { fixStyle: isAi ? "inline-type-imports" : "separate-type-imports" },
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

  // Suggest readonly for properties that are never reassigned — clarifies intent
  // https://typescript-eslint.io/rules/prefer-readonly
  builder.addRule("@typescript-eslint/prefer-readonly", isAi ? "error" : "warn")

  // Require comparator for Array.sort() — [10,2,1].sort() → [1,10,2] without one
  // https://typescript-eslint.io/rules/require-array-sort-compare
  builder.addRule("@typescript-eslint/require-array-sort-compare", [
    "error",
    { ignoreStringArrays: true },
  ])

  // Disallow unsafe type assertions — use type guards instead of `as Type`
  // https://typescript-eslint.io/rules/no-unsafe-type-assertion
  builder.addRule("@typescript-eslint/no-unsafe-type-assertion", "error")

  // Exhaustive switch — all union/enum values must be handled, no redundant defaults
  // https://typescript-eslint.io/rules/switch-exhaustiveness-check
  builder.addRule("@typescript-eslint/switch-exhaustiveness-check", [
    "error",
    {
      allowDefaultCaseForExhaustiveSwitch: false,
      requireDefaultForNonUnion: true,
    },
  ])

  // Require async keyword on functions returning Promises — intent is immediately visible
  // https://typescript-eslint.io/rules/promise-function-async
  builder.addRule("@typescript-eslint/promise-function-async", "error")

  // Enforce property-style signatures — safer due to strict parameter contravariance
  // https://typescript-eslint.io/rules/method-signature-style
  builder.addRule("@typescript-eslint/method-signature-style", [
    "error",
    "property",
  ])

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

  // Allow numbers in template literals — `${count}` is idiomatic JS
  // https://typescript-eslint.io/rules/restrict-template-expressions
  builder.overrideOptions("@typescript-eslint/restrict-template-expressions", { allowNumber: true })

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
    "eslint-config-setup/typescript-js-compat",
    ["**/*.{js,mjs,cjs}"],
    tseslint.configs.disableTypeChecked.rules ?? {},
  )

  if (isAi) {
    // ── AI mode: override severity ──────────────────────────────
    builder.overrideSeverity("@typescript-eslint/no-explicit-any", "error")

    // ── AI mode: override rules with different options ───────────
    builder.overrideRule("@typescript-eslint/no-floating-promises", [
      "error",
      { checkThenables: true, ignoreVoid: true },
    ])

    // ── AI mode: additional rules ───────────────────────────────
    builder.addRule("@typescript-eslint/no-magic-numbers", [
      "error",
      {
        ignore: [-1, 0, 1, 2],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        enforceConst: true,
        ignoreClassFieldInitialValues: true,
        ignoreEnums: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
        ignoreTypeIndexes: true,
      },
    ])
    builder.addRule("@typescript-eslint/explicit-function-return-type", [
      "error",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowIIFEs: true,
      },
    ])
    builder.addRule(
      "@typescript-eslint/explicit-member-accessibility",
      "error",
    )
    builder.addRule(
      "@typescript-eslint/prefer-enum-initializers",
      "error",
    )
    builder.addRule("@typescript-eslint/naming-convention", [
      "error",
      {
        selector: "variable",
        format: isReact
          ? ["strictCamelCase", "UPPER_CASE", "StrictPascalCase"]
          : ["strictCamelCase", "UPPER_CASE"],
        leadingUnderscore: "allowSingleOrDouble",
        trailingUnderscore: "allow",
        filter: { regex: "[- ]", match: false },
      },
      {
        selector: "function",
        format: isReact
          ? ["strictCamelCase", "StrictPascalCase"]
          : ["strictCamelCase"],
      },
      {
        selector: "parameter",
        format: ["strictCamelCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: "import",
        format: ["strictCamelCase", "StrictPascalCase", "UPPER_CASE"],
      },
      {
        selector: [
          "classProperty",
          "parameterProperty",
          "classMethod",
          "objectLiteralMethod",
          "typeMethod",
          "accessor",
        ],
        format: ["strictCamelCase"],
        leadingUnderscore: "allowSingleOrDouble",
        trailingUnderscore: "allow",
        filter: { regex: "[- ]", match: false },
      },
      {
        selector: ["objectLiteralProperty", "typeProperty"],
        format: null,
      },
      { selector: "typeLike", format: ["StrictPascalCase"] },
      {
        selector: "interface",
        format: ["StrictPascalCase"],
        custom: { regex: "^I[A-Z]", match: false },
      },
      {
        selector: "typeParameter",
        format: ["PascalCase"],
        custom: {
          regex: "^(T([A-Z][a-zA-Z]*)?|[A-Z])$",
          match: true,
        },
      },
      {
        selector: "variable",
        types: ["boolean"],
        format: ["StrictPascalCase"],
        prefix: ["is", "has", "can", "should", "will", "did"],
      },
      {
        selector: ["classProperty", "objectLiteralProperty"],
        format: null,
        modifiers: ["requiresQuotes"],
      },
    ])
    builder.addRule("@typescript-eslint/member-ordering", [
      "warn",
      {
        default: [
          "signature",
          "call-signature",
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "#private-static-field",
          "static-field",
          "public-static-method",
          "protected-static-method",
          "private-static-method",
          "#private-static-method",
          "static-method",
          "public-decorated-field",
          "protected-decorated-field",
          "private-decorated-field",
          "public-instance-field",
          "protected-instance-field",
          "private-instance-field",
          "#private-instance-field",
          "public-abstract-field",
          "protected-abstract-field",
          "field",
          "public-constructor",
          "protected-constructor",
          "private-constructor",
          "constructor",
          ["public-get", "public-set"],
          ["protected-get", "protected-set"],
          ["private-get", "private-set"],
          ["#private-get", "#private-set"],
          "public-decorated-method",
          "protected-decorated-method",
          "private-decorated-method",
          "public-instance-method",
          "protected-instance-method",
          "private-instance-method",
          "#private-instance-method",
          "public-abstract-method",
          "protected-abstract-method",
          "method",
        ],
      },
    ])
  }

  return builder.build()
}
