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
}

/** Options for pre-generated OxLint configs (oxlint flag is irrelevant here). */
export type OxlintConfigOptions = Omit<ConfigOptions, "oxlint">

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
