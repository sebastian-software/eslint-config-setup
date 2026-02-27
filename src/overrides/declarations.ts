import type { FlatConfigArray } from "../types.ts"

/**
 * Declaration file overrides — minimal rules for `.d.ts` files.
 * Declaration files follow their own patterns (ambient declarations,
 * interface merging, namespaces) that conflict with app-code rules.
 *
 * File pattern: *.d.ts files
 */
export function declarationsOverride(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/declarations",
      files: ["**/*.d.ts"],
      rules: {
        // Declaration files often have unused type parameters/variables
        "@typescript-eslint/no-unused-vars": "off",

        // Empty interfaces are valid for declaration merging
        "@typescript-eslint/no-empty-interface": "off",

        // Empty object types are used for extensible interfaces
        "@typescript-eslint/no-empty-object-type": "off",

        // `any` is sometimes necessary in third-party type declarations
        "@typescript-eslint/no-explicit-any": "off",

        // Both `type` and `interface` are valid in declarations
        "@typescript-eslint/consistent-type-definitions": "off",

        // Namespaces are standard in ambient declarations
        "@typescript-eslint/no-namespace": "off",

        // Duplicate imports happen with declaration merging
        "import-x/no-duplicates": "off",

        // Unused imports are common in re-export declaration files
        "unused-imports/no-unused-imports": "off",

        // ── AI mode rules that don't apply to declaration files ────────

        // Declarations inherit return types from the implementation
        "@typescript-eslint/explicit-function-return-type": "off",

        // Third-party naming conventions must be followed as-is
        "@typescript-eslint/naming-convention": "off",

        // Abbreviations in third-party types are unavoidable
        "unicorn/prevent-abbreviations": "off",

        // .d.ts filename is dictated by the module it declares
        "unicorn/filename-case": "off",
      },
    },
  ]
}
