import { afterAll, beforeAll, describe, expect, it } from "vitest"

import type { FlatConfigArray, SpellcheckOptions } from "../types"

import { applySpellcheckOptions, assertSpellcheckOption } from "../api/spellcheck"
import { generateConfigModule } from "../build/codegen"
import { composeConfig } from "../build/compose"
import { getOxlintConfig } from "../loader"
import { captureError, ruleOptions } from "./helpers/capture"
import { loadGeneratedConfig, removeTempDirs } from "./helpers/generated-config"

const RULE = "@cspell/spellchecker"

let loaded: FlatConfigArray

beforeAll(async () => {
  const { config } = await loadGeneratedConfig({})
  loaded = config
}, 60_000)

afterAll(() => {
  removeTempDirs()
})

function spellEntries(config: FlatConfigArray): unknown[] {
  return config.flatMap((block) => (block.rules?.[RULE] == null ? [] : [block.rules[RULE]]))
}

function singleEntry(config: FlatConfigArray): unknown {
  const entries = spellEntries(config)
  expect(entries).toHaveLength(1)
  return entries[0]
}

describe("applySpellcheckOptions", () => {
  it("carries the rule on the base block (precondition)", () => {
    const base = loaded.find((block) => block.name === "eslint-config-setup/base")
    expect(base?.rules?.[RULE]).toBeDefined()
    expect(base?.plugins?.["@cspell"]).toBeDefined()
  })

  it("removes the rule from every block but keeps the plugin registered for false", () => {
    const result = applySpellcheckOptions(loaded, false)
    expect(spellEntries(result)).toHaveLength(0)
    for (const block of result) {
      expect(block.rules && RULE in block.rules).toBeFalsy()
    }
    const base = result.find((block) => block.name === "eslint-config-setup/base")
    expect(base?.plugins?.["@cspell"]).toBeDefined()
  })

  it("derives the exact entry from the loaded entry for language and words", () => {
    const result = applySpellcheckOptions(loaded, { language: "en,de", words: ["Mandant"] })
    expect(singleEntry(result)).toStrictEqual([
      "warn",
      {
        checkComments: true,
        checkIdentifiers: true,
        checkStrings: false,
        autoFix: false,
        cspell: { language: "en,de", words: ["Mandant"] },
      },
    ])
  })

  it("sets checkIdentifiers false without emitting a cspell sub-object", () => {
    const result = applySpellcheckOptions(loaded, { checkIdentifiers: false })
    const options = ruleOptions(singleEntry(result))
    expect(options.checkIdentifiers).toBe(false)
    expect(options.checkComments).toBe(true)
    expect("cspell" in options).toBe(false)
  })

  it("treats {} and { words: undefined } like the default", () => {
    const base = singleEntry(loaded)
    expect(singleEntry(applySpellcheckOptions(loaded, {}))).toStrictEqual(base)
    expect(singleEntry(applySpellcheckOptions(loaded, { words: undefined }))).toStrictEqual(base)
  })

  it("returns the same array for undefined and true", () => {
    expect(applySpellcheckOptions(loaded, undefined)).toBe(loaded)
    expect(applySpellcheckOptions(loaded, true)).toBe(loaded)
  })

  it("copies arrays and passes empty arrays through", () => {
    const words = ["Mandant"]
    const dictionaries = ["de-de"]
    const result = applySpellcheckOptions(loaded, { words, dictionaries, import: [] })
    words.push("Leaked")
    dictionaries.push("leaked")
    const cspell = ruleOptions(singleEntry(result)).cspell
    expect(cspell).toStrictEqual({ words: ["Mandant"], dictionaries: ["de-de"], import: [] })
  })

  it("passes non-array field values through unchanged for rule-schema validation", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- deliberately invalid input from an untyped JS config
    const invalid = { words: "x", import: 42 } as unknown as SpellcheckOptions
    const cspell = ruleOptions(singleEntry(applySpellcheckOptions(loaded, invalid))).cspell
    expect(cspell).toStrictEqual({ words: "x", import: 42 })
  })

  it("does not mutate the input array, blocks or rules objects", () => {
    const blocks = [...loaded]
    const rulesRefs = loaded.map((block) => block.rules)
    const ruleSnapshots = loaded.map((block) => JSON.stringify(block.rules ?? null))

    for (const option of [false, { language: "de", words: ["x"] }] as const) {
      const result = applySpellcheckOptions(loaded, option)
      expect(result).not.toBe(loaded)
      expect(result).toHaveLength(loaded.length)
    }

    expect(loaded).toHaveLength(blocks.length)
    for (const [index, block] of loaded.entries()) {
      expect(block).toBe(blocks[index])
      expect(block.rules).toBe(rulesRefs[index])
      expect(JSON.stringify(block.rules ?? null)).toBe(ruleSnapshots[index])
    }
  })

  it("replaces only affected blocks with new objects", () => {
    const result = applySpellcheckOptions(loaded, { words: ["x"] })
    const affected = loaded.map((block) => block.rules?.[RULE] != null)
    expect(affected.some(Boolean)).toBe(true)
    expect(result.filter((block, index) => block === loaded[index])).toHaveLength(
      affected.filter((isAffected) => !isAffected).length,
    )
    expect(result.filter((block, index) => affected[index] && block.rules === loaded[index].rules)).toHaveLength(0)
  })

  it("throws an invariant error without user values when no block has the rule", () => {
    const without = applySpellcheckOptions(loaded, false)
    expect(() => applySpellcheckOptions(without, false)).toThrow(RULE)
    const { message } = captureError(() =>
      applySpellcheckOptions(without, { words: ["SecretWord"], language: "xx-secret" }),
    )
    expect(message).toContain("spellcheck")
    expect(message).not.toContain("SecretWord")
    expect(message).not.toContain("xx-secret")
    expect(() => applySpellcheckOptions(without, undefined)).not.toThrow()
    expect(() => applySpellcheckOptions(without, true)).not.toThrow()
  })
})

describe("assertSpellcheckOption", () => {
  it.each([undefined, true, false, {}, { words: ["a"] }])("accepts %j", (value) => {
    expect(() => {
      assertSpellcheckOption(value)
    }).not.toThrow()
  })

  it.each([null, "secret-de", ["secret-x"], 42])("rejects %j with a TypeError", (value) => {
    const thrown = captureError(() => {
      assertSpellcheckOption(value)
    })
    expect(thrown).toBeInstanceOf(TypeError)
    expect(thrown.message).toContain("spellcheck")
    expect(thrown.message).not.toContain("secret")
  })
})

/**
 * Type-level regression guards, checked by `tsc` (`pnpm run check`). The
 * function is never called, so the build-time functions and the loader do not
 * actually run.
 */
function spellcheckTypeGuards(): void {
  // @ts-expect-error -- build-time flags (ConfigFlags) exclude the runtime spellcheck option
  composeConfig({ spellcheck: false })
  // @ts-expect-error -- build-time flags (ConfigFlags) exclude the runtime spellcheck option
  generateConfigModule({ spellcheck: false })
  // @ts-expect-error -- OxlintConfigOptions excludes the spellcheck option
  getOxlintConfig({ spellcheck: false })
}

describe("spellcheck type guards", () => {
  it("are declared for tsc (never executed)", () => {
    expect(typeof spellcheckTypeGuards).toBe("function")
  })
})
