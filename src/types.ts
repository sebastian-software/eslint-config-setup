import type { Linter } from "eslint"

export interface ConfigOptions {
  /** Enable React 19+ rules (Hooks, Compiler, JSX-A11y, Server Components) */
  react?: boolean
  /** Enable Node.js-specific rules and globals */
  node?: boolean
  /** Use strictTypeChecked + tighter complexity limits */
  strict?: boolean
  /** Enable strict clean-code rules optimized for AI-generated code */
  ai?: boolean
  /** Disable rules already covered by OxLint (use with oxlint && eslint) */
  oxlint?: boolean
}

export type FlatConfig = Linter.Config
export type FlatConfigArray = Linter.Config[]
export type RuleSeverity = "off" | "warn" | "error"
