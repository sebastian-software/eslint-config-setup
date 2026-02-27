export { getConfig } from "./loader.ts"

export {
  addRule,
  configureRule,
  disableAllRulesBut,
  disableRule,
  setRuleSeverity,
} from "./api/rule-helpers.ts"

export { optionsToFilename, optionsToBitmask, bitmaskToHash } from "./hash.ts"

export { generateOxlintConfig } from "./build/oxlint-generator.ts"
export type { OxlintConfig } from "./build/oxlint-generator.ts"

export type {
  ConfigOptions,
  FlatConfigArray,
  RuleOptions,
  RuleScope,
  RuleSeverity,
} from "./types.ts"
