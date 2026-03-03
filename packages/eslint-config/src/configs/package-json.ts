import packageJsonPlugin, { configs as packageJsonConfigs } from "eslint-plugin-package-json"

import type { FlatConfigArray } from "../types"

/**
 * Package.json config — semantic validation of package.json files.
 *
 * Uses the recommended preset from eslint-plugin-package-json which includes:
 * - All valid-* rules (only fire on malformed existing fields, never on missing)
 * - Conservative require-* rules with ignorePrivate: true by default
 * - Quality rules (no-empty-fields, unique-dependencies, etc.)
 *
 * Sorting/ordering rules are off by default — enabled only in AI mode.
 *
 * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json
 */
export function packageJsonConfig(): FlatConfigArray {
  const recommended = packageJsonConfigs.recommended

  return [
    {
      ...recommended,
      name: "eslint-config-setup/package-json",
    },
  ]
}

/**
 * Package.json AI config — enables ordering and sorting rules.
 * Only active in AI mode where deterministic structure is enforced.
 */
export function packageJsonAiConfig(): FlatConfigArray {
  return [
    {
      name: "eslint-config-setup/package-json-ai",
      files: ["**/package.json"],
      rules: {
        // Enforce consistent property ordering in package.json
        // https://github.com/JoshuaKGoldberg/eslint-plugin-package-json
        "package-json/order-properties": "error",

        // Sort dependencies, scripts, exports, etc. alphabetically
        // https://github.com/JoshuaKGoldberg/eslint-plugin-package-json
        "package-json/sort-collections": "error",
      },
    },
  ]
}
