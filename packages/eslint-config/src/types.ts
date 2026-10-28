import type { Linter } from "eslint"

export type ConfigOptions = {
  /** Enable React 19+ rules via `@eslint-react` (Hooks, DOM, Web API leaks, JSX-A11y) */
  react?: boolean
  /** Enable Node.js-specific rules and globals */
  node?: boolean
  /** Enable strict clean-code rules optimized for AI-generated code */
  ai?: boolean
  /** Disable rules already covered by OxLint (use with oxlint && eslint) */
  oxlint?: boolean
  /**
   * Configure the `@cspell/spellchecker` rule at load time.
   * `false` disables spell checking (the `@cspell` plugin stays registered),
   * an object configures it. Default (`undefined` / `true`): the pre-generated
   * rule entry is returned unchanged. Not a pre-built flag: it does not affect
   * which config file is loaded.
   */
  spellcheck?: boolean | SpellcheckOptions
}

/**
 * Runtime options for the `@cspell/spellchecker` rule, applied by
 * `getEslintConfig()` on top of the pre-generated rule entry.
 * Omitted (or `undefined`) fields keep the pre-generated value.
 */
export type SpellcheckOptions = {
  /** cspell locale(s), comma-separated, e.g. `"en"` or `"en,de"` (maps to `cspell.language`). */
  language?: string
  /** Dictionary names to enable (maps to `cspell.dictionaries`). */
  dictionaries?: readonly string[]
  /** Extra accepted words (maps to `cspell.words`). */
  words?: readonly string[]
  /** cspell config files to import, e.g. `"@cspell/dict-de-de/cspell-ext.json"` (maps to `cspell.import`). */
  import?: readonly string[]
  /** Spell check identifiers. Default: `true`. */
  checkIdentifiers?: boolean
  /** Spell check comments. Default: `true`. */
  checkComments?: boolean
}

/**
 * Build-time flag subset of `ConfigOptions`: the options that select a
 * pre-generated config. Used by `composeConfig`, `generateConfigModule`
 * and `allPermutations`.
 */
export type ConfigFlags = Omit<ConfigOptions, "spellcheck">

/** Options for pre-generated OxLint configs (oxlint flag and spellcheck options are irrelevant here). */
export type OxlintConfigOptions = Omit<ConfigOptions, "oxlint" | "spellcheck">

export type OxlintConfigResult = {
  $schema?: string
  plugins?: string[]
  categories?: Record<string, string>
  env?: Record<string, boolean>
  globals?: Record<string, string>
  rules?: Record<string, unknown>
  overrides?: Array<{ files: string[]; rules?: Record<string, unknown> }>
}

export type FlatConfig = Linter.Config
export type FlatConfigArray = Linter.Config[]
export type RuleSeverity = "error" | "off" | "warn"

export type RuleScope =
  | "configs"
  | "declarations"
  | "e2e"
  | "scripts"
  | "stories"
  | "tests"

export type RuleOptions = {
  scope?: RuleScope
}
