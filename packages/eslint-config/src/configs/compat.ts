import type { FlatConfigArray } from "../types"

/**
 * Browser compatibility config — checks that browser APIs are available
 * in the project's browserslist targets. Uses MDN compatibility data.
 *
 * Activated automatically for non-Node projects (when `node: false`).
 * If no browserslist config exists, the default applies:
 * `> 0.5%, last 2 versions, Firefox ESR, not dead`
 *
 * @see https://github.com/amilajack/eslint-plugin-compat
 * @see https://browsersl.ist/
 */
export function compatConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/compat",
      plugins: {
        get compat() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-compat")
        },
      },
      rules: {
        // Warn when using browser APIs not supported in browserslist targets
        // https://github.com/amilajack/eslint-plugin-compat#usage
        "compat/compat": "warn",
      },
    },
  ]
}
