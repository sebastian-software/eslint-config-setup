import type { Linter } from "eslint"

export interface ConfigOptions {
  /** Enable React 19+ rules (Hooks, Compiler, JSX-A11y, Server Components) */
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

export type FlatConfig = Linter.Config
export type FlatConfigArray = Linter.Config[]
export type RuleSeverity = "off" | "warn" | "error"

export type RuleScope =
  | "tests"
  | "e2e"
  | "stories"
  | "configs"
  | "declarations"
  | "scripts"

export interface RuleOptions {
  scope?: RuleScope
}
