export { getConfig } from "./loader.ts"

export {
  addRule,
  configureRule,
  disableAllRulesBut,
  disableRule,
  setRuleSeverity,
} from "./api/rule-helpers.ts"

export { optionsToFilename, optionsToBitmask, bitmaskToHash } from "./hash.ts"

export type { ConfigOptions, FlatConfigArray, RuleSeverity } from "./types.ts"
