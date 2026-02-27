export { getConfig } from "./loader"

export {
  addRule,
  configureRule,
  disableAllRulesBut,
  disableRule,
  setRuleSeverity,
} from "./api/rule-helpers"

export { optionsToFilename, optionsToBitmask, bitmaskToHash } from "./hash"

export type {
  ConfigOptions,
  FlatConfigArray,
  RuleOptions,
  RuleScope,
  RuleSeverity,
} from "./types"
