import type { Linter } from "eslint"

import type { FlatConfig, FlatConfigArray, SpellcheckOptions } from "../types"

const SPELLCHECK_RULE = "@cspell/spellchecker"

type RuleOptionsObject = Record<string, unknown>

function isPlainObject(value: unknown): value is RuleOptionsObject {
  if (typeof value !== "object" || value === null) return false
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

/**
 * Validates the top-level shape of the `spellcheck` option.
 * Accepts `undefined`, `true`, `false` or a plain object; field-level types
 * are left to ESLint's rule-schema validation. The error message names the
 * option but never echoes the received value.
 */
export function assertSpellcheckOption(
  value: unknown,
): asserts value is boolean | SpellcheckOptions | undefined {
  if (value === undefined || typeof value === "boolean" || isPlainObject(value)) return

  throw new TypeError(
    'eslint-config-setup: Invalid "spellcheck" option. ' +
      "Expected undefined, true, false or a plain object.",
  )
}

/**
 * Copies real arrays and passes any other value through unchanged, so a wrong
 * field type (e.g. a string from an untyped JS config) reaches ESLint's
 * rule-schema validation instead of being spread into characters.
 */
function copyIfArray(value: unknown): unknown {
  return Array.isArray(value) ? [...(value as unknown[])] : value
}

/** Collects the provided (present and not `undefined`) cspell settings, copying arrays. */
function pickCspellSettings(spellcheck: SpellcheckOptions): RuleOptionsObject {
  const settings: RuleOptionsObject = {}
  if (spellcheck.language !== undefined) settings.language = spellcheck.language
  if (spellcheck.dictionaries !== undefined) settings.dictionaries = copyIfArray(spellcheck.dictionaries)
  if (spellcheck.words !== undefined) settings.words = copyIfArray(spellcheck.words)
  if (spellcheck.import !== undefined) settings.import = copyIfArray(spellcheck.import)
  return settings
}

/**
 * Merges the spellcheck options into a loaded rule entry.
 * Severity and base options are taken from the entry, not hard-coded.
 */
function mergeRuleEntry(
  entry: Linter.RuleEntry,
  spellcheck: SpellcheckOptions,
): Linter.RuleEntry {
  const severity = Array.isArray(entry) ? entry[0] : entry
  const existingOptions: RuleOptionsObject =
    Array.isArray(entry) && isPlainObject(entry[1]) ? entry[1] : {}

  const options: RuleOptionsObject = { ...existingOptions }
  if (spellcheck.checkIdentifiers !== undefined) {
    options.checkIdentifiers = spellcheck.checkIdentifiers
  }
  if (spellcheck.checkComments !== undefined) {
    options.checkComments = spellcheck.checkComments
  }

  // Only touch the cspell sub-object when a cspell setting is provided, so it
  // stays absent when neither the user nor the loaded entry defines one.
  const cspellSettings = pickCspellSettings(spellcheck)
  if (Object.keys(cspellSettings).length > 0) {
    const existingCspell = isPlainObject(existingOptions.cspell) ? existingOptions.cspell : {}
    options.cspell = { ...existingCspell, ...cspellSettings }
  }

  return [severity, options]
}

/**
 * Applies the runtime `spellcheck` option to a loaded flat config array.
 *
 * Acts on every block that carries an `@cspell/spellchecker` rule entry
 * (looked up by rule key, not by block name):
 * - `undefined` / `true`: returns the input unchanged.
 * - `false`: removes the rule entry; `plugins["@cspell"]` stays registered so
 *   existing disable directives remain valid and the rule can be re-enabled.
 * - object: merges the provided options into the loaded entry.
 *
 * Never mutates its input: returns a new array, and every affected block is
 * replaced by a new block object with a new `rules` object.
 *
 * @throws {Error} When `spellcheck` is `false` or an object and no block
 *   carries the rule (the loaded config does not match this package version).
 */
export function applySpellcheckOptions(
  config: FlatConfigArray,
  spellcheck: boolean | SpellcheckOptions | undefined,
): FlatConfigArray {
  if (spellcheck === undefined || spellcheck === true) return config

  const hasRule = config.some((block) => block.rules?.[SPELLCHECK_RULE] != null)
  if (!hasRule) {
    throw new Error(
      `eslint-config-setup: Cannot apply the "spellcheck" option because the loaded config ` +
        `has no "${SPELLCHECK_RULE}" rule. The installed package appears to be inconsistent; ` +
        `reinstall eslint-config-setup or report a bug.`,
    )
  }

  return config.map((block): FlatConfig => {
    const entry = block.rules?.[SPELLCHECK_RULE]
    if (entry == null) return block

    const rules = { ...block.rules }
    if (spellcheck === false) {
      Reflect.deleteProperty(rules, SPELLCHECK_RULE)
    } else {
      rules[SPELLCHECK_RULE] = mergeRuleEntry(entry, spellcheck)
    }
    return { ...block, rules }
  })
}
