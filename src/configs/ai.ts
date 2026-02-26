import type { ConfigOptions, FlatConfigArray } from "../types.ts"

/**
 * AI mode rules — strict clean-code rules that are trivial for AI assistants
 * to follow but produce significantly more maintainable code.
 *
 * These rules would traditionally be considered "too strict" for humans,
 * but since most code is now AI-generated, they serve as effective
 * guardrails that the AI cannot ignore (unlike documentation).
 */
export function aiConfig(opts: ConfigOptions): FlatConfigArray {
  const configs: FlatConfigArray = [
    {
      name: "@effective/eslint/ai-structural",
      rules: {
        // A. Structural clarity — always explicit, never ambiguous
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
        "prefer-const": ["error", { destructuring: "all" }],
        "no-var": "error",
        eqeqeq: "error",
        "prefer-template": "error",
        "object-shorthand": ["error", "always"],
        "arrow-body-style": "error",
        "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
        "logical-assignment-operators": [
          "error",
          "always",
          { enforceForIfStatements: true },
        ],
        "no-return-assign": ["error", "always"],
        "max-statements-per-line": ["error", { max: 1 }],

        // B. Magic numbers & constants — no unexplained code
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
        "sonarjs/no-duplicate-string": ["error", { threshold: 3 }],
        "no-warning-comments": "warn",

        // F. Async/Promise hygiene
        "no-await-in-loop": "error",
        "no-promise-executor-return": "error",
        "@typescript-eslint/no-floating-promises": [
          "error",
          { checkThenables: true, ignoreVoid: true },
        ],
      },
    },
    {
      name: "@effective/eslint/ai-typescript",
      rules: {
        // C. TypeScript strictness — explicit types, safe patterns
        "@typescript-eslint/explicit-function-return-type": [
          "error",
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
            allowIIFE: true,
          },
        ],
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
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/consistent-type-exports": [
          "error",
          { fixMixedExportsWithInlineTypeSpecifier: true },
        ],
        "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true }],
        "@typescript-eslint/prefer-readonly": "error",
        "@typescript-eslint/promise-function-async": "error",
        "@typescript-eslint/switch-exhaustiveness-check": [
          "error",
          {
            allowDefaultCaseForExhaustiveSwitch: false,
            requireDefaultForNonUnion: true,
          },
        ],
        "@typescript-eslint/no-unsafe-type-assertion": "error",
        "@typescript-eslint/require-array-sort-compare": [
          "error",
          { ignoreStringArrays: true },
        ],
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      },
    },
    {
      name: "@effective/eslint/ai-unicorn",
      rules: {
        // D. Unicorn — modern, idiomatic patterns
        "unicorn/prefer-early-return": "error",
        "unicorn/consistent-function-scoping": "error",
        "unicorn/no-abusive-eslint-disable": "error",
        "unicorn/no-array-for-each": "error",
        "unicorn/no-array-reduce": "error",
        "unicorn/prefer-ternary": ["error", "only-single-line"],
        "unicorn/prefer-switch": ["error", { minimumCases: 3 }],
        "unicorn/filename-case": [
          "error",
          { cases: { camelCase: true, pascalCase: true } },
        ],
        "unicorn/prevent-abbreviations": "error",
      },
    },
    {
      name: "@effective/eslint/ai-sonarjs",
      rules: {
        // E. SonarJS — code quality and duplicates
        "sonarjs/no-identical-functions": "error",
        "sonarjs/no-collapsible-if": "error",
        "sonarjs/no-redundant-boolean": "error",
        "sonarjs/no-unused-collection": "error",
        "sonarjs/prefer-immediate-return": "error",
        "sonarjs/prefer-single-boolean-return": "error",
        "sonarjs/no-identical-expressions": "error",
        "sonarjs/no-inverted-boolean-check": "error",
      },
    },
  ]

  // G. Tightened complexity limits for AI mode
  const isAlsoStrict = opts.strict
  configs.push({
    name: "@effective/eslint/ai-complexity",
    rules: {
      complexity: ["error", isAlsoStrict ? 8 : 10],
      "max-depth": ["error", isAlsoStrict ? 2 : 3],
      "max-nested-callbacks": ["error", isAlsoStrict ? 1 : 2],
      "max-params": ["error", isAlsoStrict ? 2 : 3],
      "max-statements": ["error", isAlsoStrict ? 10 : 15],
      "max-lines-per-function": [
        "error",
        {
          max: isAlsoStrict ? 35 : 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines": [
        "error",
        {
          max: isAlsoStrict ? 200 : 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "sonarjs/cognitive-complexity": ["error", isAlsoStrict ? 8 : 10],
    },
  })

  // AI mode relaxations for test files
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

  // AI mode relaxations for E2E test files
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

  // AI mode relaxations for config files
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

  // AI mode relaxations for .d.ts files
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
