import type { FlatConfigArray } from "../types"

/**
 * AI mode rules — strict clean-code rules that are trivial for AI assistants
 * to follow but produce significantly more maintainable code.
 *
 * These rules would traditionally be considered "too strict" for humans,
 * but since most code is now AI-generated, they serve as effective
 * guardrails that the AI cannot ignore (unlike documentation).
 *
 * No plugin preset is used — all rules are hand-picked from existing plugins
 * and tightened beyond their defaults for AI-generated code.
 *
 * @see ADR-0003: docs/adr/0003-ai-mode-as-dedicated-flag.md
 */
export function aiConfig(): FlatConfigArray {
  const configs: FlatConfigArray = [
    {
      name: "@effective/eslint/ai-structural",
      rules: {
        // ── A. Structural clarity — always explicit, never ambiguous ──

        // Require braces for ALL control flow — no ambiguous one-liners
        // https://eslint.org/docs/latest/rules/curly
        curly: ["error", "all"],

        // Disallow else after return — flattens control flow
        // https://eslint.org/docs/latest/rules/no-else-return
        "no-else-return": ["error", { allowElseIf: false }],

        // No nested ternaries — unreadable, use if/else or early return
        // https://eslint.org/docs/latest/rules/no-nested-ternary
        "no-nested-ternary": "error",

        // No ternary when simpler alternatives exist (e.g., || or ??)
        // https://eslint.org/docs/latest/rules/no-unneeded-ternary
        "no-unneeded-ternary": "error",

        // No negated conditions in if/else — flip the branches instead
        // https://eslint.org/docs/latest/rules/no-negated-condition
        "no-negated-condition": "error",

        // No standalone if in else — use else-if instead
        // https://eslint.org/docs/latest/rules/no-lonely-if
        "no-lonely-if": "error",

        // No parameter reassignment — prevents subtle mutation bugs
        // https://eslint.org/docs/latest/rules/no-param-reassign
        "no-param-reassign": ["error", { props: true }],

        // One assignment per statement — prevents `a = b = c` chains
        // https://eslint.org/docs/latest/rules/no-multi-assign
        "no-multi-assign": "error",

        // One variable per declaration — clear and grep-friendly
        // https://eslint.org/docs/latest/rules/one-var
        "one-var": ["error", "never"],

        // No implicit type coercion (!!x, +x, "" + x) — use explicit Boolean/Number/String
        // https://eslint.org/docs/latest/rules/no-implicit-coercion
        "no-implicit-coercion": "error",

        // Prefer const for all bindings in destructuring when possible
        // https://eslint.org/docs/latest/rules/prefer-const
        "prefer-const": ["error", { destructuring: "all" }],

        // Disallow var — block-scoped let/const only
        // https://eslint.org/docs/latest/rules/no-var
        "no-var": "error",

        // Require strict equality (===) — no type coercion
        // https://eslint.org/docs/latest/rules/eqeqeq
        eqeqeq: "error",

        // Prefer template literals over concatenation — more readable
        // https://eslint.org/docs/latest/rules/prefer-template
        "prefer-template": "error",

        // Require shorthand properties in objects — concise, skip quoted keys
        // https://eslint.org/docs/latest/rules/object-shorthand
        "object-shorthand": ["error", "always", { avoidQuotes: true }],

        // Prefer concise arrow body: `() => expr` over `() => { return expr }`
        // https://eslint.org/docs/latest/rules/arrow-body-style
        "arrow-body-style": "error",

        // Prefer arrow functions for callbacks — lexical `this`
        // https://eslint.org/docs/latest/rules/prefer-arrow-callback
        "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],

        // Prefer `x ??= y` over `x = x ?? y` — concise null-coalescing assignment
        // https://eslint.org/docs/latest/rules/logical-assignment-operators
        "logical-assignment-operators": [
          "error",
          "always",
          { enforceForIfStatements: true },
        ],

        // No assignment in return statements — separate mutation from return
        // https://eslint.org/docs/latest/rules/no-return-assign
        "no-return-assign": ["error", "always"],

        // One statement per line — scannable, diff-friendly
        // https://eslint.org/docs/latest/rules/max-statements-per-line
        "max-statements-per-line": ["error", { max: 1 }],

        // Prefer `x ** 2` over `Math.pow(x, 2)` — modern operator syntax
        // https://eslint.org/docs/latest/rules/prefer-exponentiation-operator
        "prefer-exponentiation-operator": "error",

        // Require named capture groups in regex — self-documenting patterns
        // https://eslint.org/docs/latest/rules/prefer-named-capture-group
        "prefer-named-capture-group": "error",

        // Require Unicode-aware regex (`u` or `v` flag) — correct string handling
        // https://eslint.org/docs/latest/rules/require-unicode-regexp
        "require-unicode-regexp": "error",

        // ── B. Magic numbers & constants — no unexplained code ────────

        // No magic numbers — extract to named constants (allows -1, 0, 1, 2)
        // https://typescript-eslint.io/rules/no-magic-numbers
        "@typescript-eslint/no-magic-numbers": [
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
        ],

        // No duplicate strings (threshold 3) — extract to constant
        // https://sonarsource.github.io/rspec/#/rspec/S1192/javascript
        "sonarjs/no-duplicate-string": ["error", { threshold: 3 }],

        // Flag TODO/FIXME/HACK comments — technical debt tracker
        // https://eslint.org/docs/latest/rules/no-warning-comments
        "no-warning-comments": "warn",

        // ── F. Async/Promise hygiene ──────────────────────────────────

        // No await inside loops — use Promise.all() for parallel execution
        // https://eslint.org/docs/latest/rules/no-await-in-loop
        "no-await-in-loop": "error",

        // Disallow returning values from Promise executors — use resolve/reject
        // https://eslint.org/docs/latest/rules/no-promise-executor-return
        "no-promise-executor-return": "error",

        // Every Promise must be awaited, returned, or voided — prevents silent failures
        // https://typescript-eslint.io/rules/no-floating-promises
        "@typescript-eslint/no-floating-promises": [
          "error",
          { checkThenables: true, ignoreVoid: true },
        ],
      },
    },
    {
      name: "@effective/eslint/ai-typescript",
      rules: {
        // ── C. TypeScript strictness — explicit types, safe patterns ──

        // Require explicit return types — self-documenting function signatures
        // https://typescript-eslint.io/rules/explicit-function-return-type
        "@typescript-eslint/explicit-function-return-type": [
          "error",
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
            allowIIFE: true,
          },
        ],

        // Enforce consistent naming: camelCase for values, PascalCase for types,
        // is/has/can/should/will/did prefix for boolean variables
        // https://typescript-eslint.io/rules/naming-convention
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: [
              "variable",
              "function",
              "classProperty",
              "objectLiteralProperty",
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
            selector: "typeLike",
            format: ["StrictPascalCase"],
          },
          {
            // No "I" prefix on interfaces — use descriptive names (XO convention)
            selector: "interface",
            format: ["StrictPascalCase"],
            custom: { regex: "^I[A-Z]", match: false },
          },
          {
            // Type parameters: single uppercase letter (T) or PascalCase (TResult)
            selector: "typeParameter",
            format: ["PascalCase"],
            custom: { regex: "^(T([A-Z][a-zA-Z]*)?|[A-Z])$", match: true },
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
        ],

        // Enforce `import type { T }` — types are erased at compile time
        // https://typescript-eslint.io/rules/consistent-type-imports
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "inline-type-imports" },
        ],

        // Enforce `export type { T }` — matches import convention
        // https://typescript-eslint.io/rules/consistent-type-exports
        "@typescript-eslint/consistent-type-exports": [
          "error",
          { fixMixedExportsWithInlineTypeSpecifier: true },
        ],

        // Disallow `any` type — auto-fix to `unknown` for type safety
        // https://typescript-eslint.io/rules/no-explicit-any
        "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true }],

        // Prefer readonly for unmodified class properties — signals immutability
        // https://typescript-eslint.io/rules/prefer-readonly
        "@typescript-eslint/prefer-readonly": "error",

        // Functions returning promises must be async — consistent async patterns
        // https://typescript-eslint.io/rules/promise-function-async
        "@typescript-eslint/promise-function-async": "error",

        // Exhaustive switch statements — no missing cases, no unnecessary defaults
        // https://typescript-eslint.io/rules/switch-exhaustiveness-check
        "@typescript-eslint/switch-exhaustiveness-check": [
          "error",
          {
            allowDefaultCaseForExhaustiveSwitch: false,
            requireDefaultForNonUnion: true,
          },
        ],

        // Disallow unsafe type assertions (as Type) — use type guards instead
        // https://typescript-eslint.io/rules/no-unsafe-type-assertion
        "@typescript-eslint/no-unsafe-type-assertion": "error",

        // Require comparator for Array.sort() — prevents locale-dependent string sort
        // https://typescript-eslint.io/rules/require-array-sort-compare
        "@typescript-eslint/require-array-sort-compare": [
          "error",
          { ignoreStringArrays: true },
        ],

        // Require explicit `public`/`private`/`protected` on class members
        // https://typescript-eslint.io/rules/explicit-member-accessibility
        "@typescript-eslint/explicit-member-accessibility": "error",

        // Enforce property style for method signatures — prevents bivariance issues
        // https://typescript-eslint.io/rules/method-signature-style
        "@typescript-eslint/method-signature-style": ["error", "property"],

        // Require explicit values for enum members — prevents accidental shifts on reorder
        // https://typescript-eslint.io/rules/prefer-enum-initializers
        "@typescript-eslint/prefer-enum-initializers": "error",

        // Prefer `type` over `interface` — consistent, supports unions/intersections
        // https://typescript-eslint.io/rules/consistent-type-definitions
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],

        // Enforce consistent member ordering in classes and interfaces
        // Static → fields by visibility → constructors → methods by visibility (XO convention)
        // https://typescript-eslint.io/rules/member-ordering
        "@typescript-eslint/member-ordering": [
          "warn",
          {
            default: [
              // Index signature
              "signature",
              "call-signature",

              // Static
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

              // Fields
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

              // Constructors
              "public-constructor",
              "protected-constructor",
              "private-constructor",
              "constructor",

              // Getters/Setters
              ["public-get", "public-set"],
              ["protected-get", "protected-set"],
              ["private-get", "private-set"],
              ["#private-get", "#private-set"],

              // Methods
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
        ],
      },
    },
    {
      name: "@effective/eslint/ai-unicorn",
      rules: {
        // ── D. Unicorn — modern, idiomatic patterns ───────────────────

        // Prefer early return over deeply nested if/else — flattens logic
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-early-return.md
        "unicorn/prefer-early-return": "error",

        // Move functions to the smallest scope where they're used
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/consistent-function-scoping.md
        "unicorn/consistent-function-scoping": "error",

        // Forbid blanket `/* eslint-disable */` — must specify rules
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-abusive-eslint-disable.md
        "unicorn/no-abusive-eslint-disable": "error",

        // No .forEach() — use for-of loop (breakable, async-safe)
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-for-each.md
        "unicorn/no-array-for-each": "error",

        // No .reduce() — explicit loops are more readable
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-reduce.md
        "unicorn/no-array-reduce": "error",

        // Prefer simple ternary over if/else for single-line assignments
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-ternary.md
        "unicorn/prefer-ternary": ["error", "only-single-line"],

        // Prefer switch for 3+ conditions on same variable — structured
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-switch.md
        "unicorn/prefer-switch": ["error", { minimumCases: 3 }],

        // Enforce camelCase or PascalCase filenames — consistent project structure
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md
        "unicorn/filename-case": [
          "error",
          { cases: { camelCase: true, pascalCase: true } },
        ],

        // Prevent abbreviated variable names (e → error, btn → button) — readable
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prevent-abbreviations.md
        "unicorn/prevent-abbreviations": "error",

        // Detect useless switch cases that fall through to the next case
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-switch-case.md
        "unicorn/no-useless-switch-case": "error",

        // Enforce correct Error subclassing (name, constructor pattern)
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/custom-error-definition.md
        "unicorn/custom-error-definition": "error",

        // Prefer default parameters over manual reassignment
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-default-parameters.md
        "unicorn/prefer-default-parameters": "error",

        // Prefer `a || b` over `a ? a : b` — simpler when equivalent
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-logical-operator-over-ternary.md
        "unicorn/prefer-logical-operator-over-ternary": "error",

        // Prefer Math.min()/Math.max() over ternaries for clamping
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-math-min-max.md
        "unicorn/prefer-math-min-max": "error",

        // Prefer Set#size over converting to array — direct and correct
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-set-size.md
        "unicorn/prefer-set-size": "error",

        // Enforce explicit `.length > 0` / `.length === 0` checks
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/explicit-length-check.md
        "unicorn/explicit-length-check": "error",

        // Prefer for-of over C-style for loops — no off-by-one risk
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-for-loop.md
        "unicorn/no-for-loop": "error",

        // Enforce braces in switch cases — prevents scope leakage
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/switch-case-braces.md
        "unicorn/switch-case-braces": "error",

        // Combine multiple .push() calls into one — cleaner
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-push-push.md
        "unicorn/no-array-push-push": "error",
      },
    },
    {
      name: "@effective/eslint/ai-sonarjs",
      rules: {
        // ── E. SonarJS — code quality and duplicates ──────────────────

        // Detect copy-pasted functions — extract to shared helper
        // https://sonarsource.github.io/rspec/#/rspec/S4144/javascript
        "sonarjs/no-identical-functions": "error",

        // Merge nested if-statements that can be combined — reduce nesting
        // https://sonarsource.github.io/rspec/#/rspec/S1066/javascript
        "sonarjs/no-collapsible-if": "error",

        // Simplify redundant boolean expressions
        // https://sonarsource.github.io/rspec/#/rspec/S1125/javascript
        "sonarjs/no-redundant-boolean": "error",

        // Detect collections that are populated but never read — dead code
        // https://sonarsource.github.io/rspec/#/rspec/S4030/javascript
        "sonarjs/no-unused-collection": "error",

        // Return value directly instead of storing in temp variable
        // https://sonarsource.github.io/rspec/#/rspec/S1488/javascript
        "sonarjs/prefer-immediate-return": "error",

        // Simplify boolean return patterns
        // https://sonarsource.github.io/rspec/#/rspec/S1126/javascript
        "sonarjs/prefer-single-boolean-return": "error",

        // Detect identical sub-expressions on both sides of operator
        // https://sonarsource.github.io/rspec/#/rspec/S1764/javascript
        "sonarjs/no-identical-expressions": "error",

        // Simplify negated boolean checks — `!a !== b` → `a === b`
        // https://sonarsource.github.io/rspec/#/rspec/S1940/javascript
        "sonarjs/no-inverted-boolean-check": "error",

        // Disallow nested switch statements — extract to function
        // https://sonarsource.github.io/rspec/#/rspec/S1821/javascript
        "sonarjs/no-nested-switch": "error",

        // Disallow nested template literals — unreadable
        // https://sonarsource.github.io/rspec/#/rspec/S4624/javascript
        "sonarjs/no-nested-template-literals": "error",

        // Limit union type size — too many members signals missing abstraction
        // https://sonarsource.github.io/rspec/#/rspec/S4622/javascript
        "sonarjs/max-union-size": ["error", { max: 5 }],

        // Prefer type predicates for type narrowing — safer than assertions
        // https://sonarsource.github.io/rspec/#/rspec/S4322/javascript
        "sonarjs/prefer-type-guard": "error",

        // Public static fields should be readonly — prevents accidental mutation
        // https://sonarsource.github.io/rspec/#/rspec/S1444/javascript
        "sonarjs/public-static-readonly": "error",
      },
    },
  ]

  // ── G. Tightened complexity limits for AI mode ────────────────────
  configs.push({
    name: "@effective/eslint/ai-complexity",
    rules: {
      // Cyclomatic complexity limit — max branches per function
      // https://eslint.org/docs/latest/rules/complexity
      complexity: ["error", 10],

      // Max nesting depth — deep nesting signals need for extraction
      // https://eslint.org/docs/latest/rules/max-depth
      "max-depth": ["error", 3],

      // Max nested callbacks — prevents callback hell
      // https://eslint.org/docs/latest/rules/max-nested-callbacks
      "max-nested-callbacks": ["error", 2],

      // Max function parameters — many params suggest a config object
      // https://eslint.org/docs/latest/rules/max-params
      "max-params": ["error", 3],

      // Max statements per function — keeps functions focused
      // https://eslint.org/docs/latest/rules/max-statements
      "max-statements": ["error", 15],

      // Max lines per function — encourages extraction of helpers
      // https://eslint.org/docs/latest/rules/max-lines-per-function
      "max-lines-per-function": [
        "error",
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // Max lines per file — encourages modular file organization
      // https://eslint.org/docs/latest/rules/max-lines
      "max-lines": [
        "error",
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // Cognitive complexity — measures how hard a function is to understand
      // https://sonarsource.github.io/rspec/#/rspec/S3776/javascript
      "sonarjs/cognitive-complexity": ["error", 10],
    },
  })

  // ── AI mode: stricter test structure ─────────────────────────────
  // AI-generated tests should follow strict organizational patterns
  configs.push({
    name: "@effective/eslint/ai-tests-strict",
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      // Every test must be inside a describe block — organized test suites
      // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-top-level-describe.md
      "vitest/require-top-level-describe": "error",

      // Hooks (beforeEach, afterEach) must be at the top of describe — predictable setup
      // https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-hooks-on-top.md
      "vitest/prefer-hooks-on-top": "error",
    },
  })

  // ── AI mode relaxations for test files ────────────────────────────
  // Tests are naturally verbose (setup, assertions, descriptions)
  configs.push({
    name: "@effective/eslint/ai-tests-relaxed",
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "sonarjs/no-duplicate-string": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/naming-convention": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  })

  // ── AI mode relaxations for E2E test files ────────────────────────
  // E2E tests are long procedural scripts with page interactions
  configs.push({
    name: "@effective/eslint/ai-e2e-relaxed",
    files: ["**/*.spec.ts"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  })

  // ── AI mode relaxations for config files ──────────────────────────
  // Config files (vite, vitest, next, etc.) have their own patterns
  configs.push({
    name: "@effective/eslint/ai-config-relaxed",
    files: [
      "**/*.config.{ts,mts,cts,js,mjs,cjs}",
      "**/vite.config.*",
      "**/vitest.config.*",
      "**/next.config.*",
    ],
    rules: {
      complexity: "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/naming-convention": "off",
    },
  })

  // ── AI mode relaxations for .d.ts files ───────────────────────────
  // Declaration files follow their own patterns (ambient types, namespaces)
  configs.push({
    name: "@effective/eslint/ai-declarations-relaxed",
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": "off",
    },
  })

  return configs
}
