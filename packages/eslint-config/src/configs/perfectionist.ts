import perfectionistPlugin from "eslint-plugin-perfectionist"

import type { FlatConfigArray } from "../types"

/**
 * Perfectionist config — deterministic sorting of code elements.
 *
 * Sorts everything Prettier doesn't: imports, exports, union types,
 * object keys, interface members, etc. Especially valuable for
 * AI-generated code where ordering is arbitrary.
 *
 * Replaces `simple-import-sort` — perfectionist handles everything
 * simple-import-sort does, plus TypeScript path alias recognition
 * and named import sorting.
 *
 * Core philosophy: `partitionByNewLine: true` globally — semantic
 * grouping via blank lines is preserved, within groups natural sort.
 *
 * @see https://perfectionist.dev
 */

/**
 * Mechanical sorting rules — always active.
 * These have no semantic dimension: the order of imports, named exports,
 * or union type members carries no meaning.
 */
export function perfectionistConfig(): FlatConfigArray {
  return [
    {
      name: "eslint-config-setup/perfectionist",
      plugins: {
        perfectionist: perfectionistPlugin,
      },
      settings: {
        perfectionist: {
          type: "natural",
          order: "asc",
          partitionByNewLine: true,
        },
      },
      rules: {
        // Auto-sort import statements — deterministic ordering regardless of input
        // Replaces simple-import-sort/imports
        // https://perfectionist.dev/rules/sort-imports
        "perfectionist/sort-imports": [
          "error",
          {
            partitionByNewLine: false,
          },
        ],

        // Sort specifiers inside `import { a, b, c }` — deterministic
        // https://perfectionist.dev/rules/sort-named-imports
        "perfectionist/sort-named-imports": "error",

        // Sort specifiers inside `export { a, b, c }` — deterministic
        // https://perfectionist.dev/rules/sort-named-exports
        "perfectionist/sort-named-exports": "error",

        // Auto-sort export statements — deterministic ordering
        // Replaces simple-import-sort/exports
        // https://perfectionist.dev/rules/sort-exports
        "perfectionist/sort-exports": "error",

        // Sort union type members — `number | string` has no semantic order
        // https://perfectionist.dev/rules/sort-union-types
        "perfectionist/sort-union-types": "error",

        // Sort intersection type members — `A & B` has no semantic order
        // https://perfectionist.dev/rules/sort-intersection-types
        "perfectionist/sort-intersection-types": "error",
      },
    },
  ]
}

/**
 * Structural sorting rules — AI mode only.
 * These sort code elements that *could* have semantic ordering
 * (e.g., object keys grouped by concern). Enforcing alphabetical
 * order here is a trade-off: consistency over intent. Worth it
 * for AI-generated code where "intent" is often random.
 */
export function perfectionistAiConfig(): FlatConfigArray {
  return [
    {
      name: "eslint-config-setup/perfectionist-ai",
      rules: {
        // Sort interface members — consistent shape definitions
        // https://perfectionist.dev/rules/sort-interfaces
        "perfectionist/sort-interfaces": "error",

        // Sort object type members — consistent type definitions
        // https://perfectionist.dev/rules/sort-object-types
        "perfectionist/sort-object-types": "error",

        // Sort enum members — consistent enum definitions
        // https://perfectionist.dev/rules/sort-enums
        "perfectionist/sort-enums": "error",

        // Sort JSX props — consistent component usage
        // https://perfectionist.dev/rules/sort-jsx-props
        "perfectionist/sort-jsx-props": "error",

        // Sort object keys — consistent object literals
        // https://perfectionist.dev/rules/sort-objects
        "perfectionist/sort-objects": "error",

        // Sort class members — consistent class structure
        // https://perfectionist.dev/rules/sort-classes
        "perfectionist/sort-classes": "error",

        // Sort switch cases — consistent case ordering
        // https://perfectionist.dev/rules/sort-switch-case
        "perfectionist/sort-switch-case": "error",

        // Sort Map entries — consistent Map initialization
        // https://perfectionist.dev/rules/sort-maps
        "perfectionist/sort-maps": "error",

        // Sort Set entries — consistent Set initialization
        // https://perfectionist.dev/rules/sort-sets
        "perfectionist/sort-sets": "error",

        // Sort array.includes() members — consistent membership checks
        // https://perfectionist.dev/rules/sort-array-includes
        "perfectionist/sort-array-includes": "error",
      },
    },
  ]
}
