export { getEslintConfig, getOxlintConfig } from "./loader"

export {
  addRule,
  configureRule,
  disableAllRulesBut,
  disableRule,
  setRuleSeverity,
} from "./api/rule-helpers"

export { bitmaskToHash, optionsToBitmask, optionsToFilename } from "./hash"

export type {
  ConfigOptions,
  FlatConfigArray,
  OxlintConfigOptions,
  RuleOptions,
  RuleScope,
  RuleSeverity,
} from "./types"
