import { describe, expect, it } from "vitest"

import { composeConfig } from "../build/compose.ts"
import type { ConfigOptions, FlatConfigArray } from "../types.ts"

/**
 * Extracts a stable, snapshotable representation of a config.
 * Strips functions/plugins (which aren't serializable) and keeps
 * the structure: block names, file patterns, and rule values.
 */
function extractSnapshot(config: FlatConfigArray) {
  return config
    .filter((block) => block.name || block.rules || block.files)
    .map((block) => ({
      name: block.name ?? "(unnamed)",
      ...(block.files ? { files: block.files } : {}),
      ...(block.language ? { language: block.language } : {}),
      ...(block.rules ? { rules: sortRules(block.rules) } : {}),
    }))
}

function sortRules(rules: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(rules).sort()) {
    sorted[key] = rules[key]
  }
  return sorted
}

// Key permutations that cover all meaningful combinations
const SNAPSHOT_PERMUTATIONS: Array<{ label: string; opts: ConfigOptions }> = [
  { label: "base (no flags)", opts: {} },
  { label: "react only", opts: { react: true } },
  { label: "node only", opts: { node: true } },
  { label: "strict only", opts: { strict: true } },
  { label: "ai only", opts: { ai: true } },
  { label: "react + node", opts: { react: true, node: true } },
  { label: "react + strict", opts: { react: true, strict: true } },
  { label: "react + ai", opts: { react: true, ai: true } },
  { label: "ai + strict", opts: { ai: true, strict: true } },
  {
    label: "react + node + strict + ai",
    opts: { react: true, node: true, strict: true, ai: true },
  },
  {
    label: "react + oxlint",
    opts: { react: true, oxlint: true },
  },
  {
    label: "all flags",
    opts: { react: true, node: true, strict: true, ai: true, oxlint: true },
  },
]

describe("config snapshots", () => {
  for (const { label, opts } of SNAPSHOT_PERMUTATIONS) {
    it(`snapshot: ${label}`, () => {
      const config = composeConfig(opts)
      const snapshot = extractSnapshot(config)
      expect(snapshot).toMatchSnapshot()
    })
  }
})

describe("config rule stability", () => {
  it("base config always includes eslint:recommended core rules", () => {
    const config = composeConfig({})
    const baseBlock = config.find((b) => b.name === "@effective/eslint/base")
    expect(baseBlock?.rules).toBeDefined()
    expect(baseBlock!.rules!["eqeqeq"]).toBe("error")
    expect(baseBlock!.rules!["no-var"]).toBe("error")
    expect(baseBlock!.rules!["prefer-const"]).toBe("error")
    expect(baseBlock!.rules!.curly).toBe("error")
  })

  it("typescript config always includes type-checked rules", () => {
    const config = composeConfig({})
    const tsBlock = config.find(
      (b) => b.name === "@effective/eslint/typescript",
    )
    expect(tsBlock?.rules).toBeDefined()
    expect(
      tsBlock!.rules!["@typescript-eslint/consistent-type-imports"],
    ).toBeDefined()
    expect(
      tsBlock!.rules!["@typescript-eslint/consistent-type-exports"],
    ).toBeDefined()
  })

  it("strict mode uses strictTypeChecked", () => {
    const strictConfig = composeConfig({ strict: true })
    const hasStrictBlock = strictConfig.some(
      (b) => b.name === "typescript-eslint/strict-type-checked",
    )
    const normalConfig = composeConfig({})
    const hasRecommendedBlock = normalConfig.some(
      (b) => b.name === "typescript-eslint/recommended-type-checked",
    )
    expect(hasStrictBlock).toBe(true)
    expect(hasRecommendedBlock).toBe(true)
  })

  it("unicorn config includes core modern-JS rules", () => {
    const config = composeConfig({})
    const unicornBlock = config.find(
      (b) => b.name === "@effective/eslint/unicorn",
    )
    expect(unicornBlock?.rules).toBeDefined()
    expect(unicornBlock!.rules!["unicorn/prefer-array-flat-map"]).toBe("error")
    expect(unicornBlock!.rules!["unicorn/prefer-structured-clone"]).toBe(
      "error",
    )
    expect(unicornBlock!.rules!["unicorn/no-useless-spread"]).toBe("error")
  })

  it("sonarjs config includes quality rules", () => {
    const config = composeConfig({})
    const sonarBlock = config.find(
      (b) => b.name === "@effective/eslint/sonarjs",
    )
    expect(sonarBlock?.rules).toBeDefined()
    expect(sonarBlock!.rules!["sonarjs/no-identical-functions"]).toBe("error")
    expect(sonarBlock!.rules!["sonarjs/no-collapsible-if"]).toBe("error")
  })

  it("react config includes hooks, compiler, and a11y rules", () => {
    const config = composeConfig({ react: true })
    const reactBlock = config.find(
      (b) => b.name === "@effective/eslint/react",
    )
    expect(reactBlock?.rules).toBeDefined()
    expect(reactBlock!.rules!["react-hooks/rules-of-hooks"]).toBe("error")
    expect(reactBlock!.rules!["react-hooks/exhaustive-deps"]).toBe("error")
    expect(reactBlock!.rules!["react-compiler/react-compiler"]).toBe("error")
    expect(reactBlock!.rules!["jsx-a11y/alt-text"]).toBe("error")
    expect(reactBlock!.rules!["jsx-a11y/anchor-is-valid"]).toBe("error")
  })

  it("security config includes critical rules", () => {
    const config = composeConfig({})
    const secBlock = config.find(
      (b) => b.name === "@effective/eslint/security",
    )
    expect(secBlock?.rules).toBeDefined()
    expect(secBlock!.rules!["security/detect-eval-with-expression"]).toBe(
      "error",
    )
    expect(secBlock!.rules!["security/detect-unsafe-regex"]).toBe("error")
  })

  it("json config targets .json files with correct language", () => {
    const config = composeConfig({})
    const jsonBlock = config.find((b) => b.name === "@effective/eslint/json")
    expect(jsonBlock?.files).toEqual(["**/*.json"])
    expect(jsonBlock?.language).toBe("json/json")

    const jsoncBlock = config.find((b) => b.name === "@effective/eslint/jsonc")
    expect(jsoncBlock?.language).toBe("json/jsonc")
  })

  it("markdown config targets .md files", () => {
    const config = composeConfig({})
    const mdBlock = config.find(
      (b) => b.name === "@effective/eslint/markdown",
    )
    expect(mdBlock?.files).toEqual(["**/*.md"])
    expect(mdBlock?.language).toBe("markdown/commonmark")
  })
})

describe("config block counts per permutation", () => {
  it("base config has a stable number of blocks", () => {
    const config = composeConfig({})
    expect(config.length).toMatchSnapshot()
  })

  it("react adds additional blocks", () => {
    const base = composeConfig({})
    const withReact = composeConfig({ react: true })
    expect(withReact.length).toBeGreaterThan(base.length)
  })

  it("AI mode adds additional blocks", () => {
    const base = composeConfig({})
    const withAi = composeConfig({ ai: true })
    expect(withAi.length).toBeGreaterThan(base.length)
  })

  it("oxlint adds blocks at the end", () => {
    const base = composeConfig({})
    const withOx = composeConfig({ oxlint: true })
    expect(withOx.length).toBeGreaterThan(base.length)
  })

  it("all flags together has the most blocks", () => {
    const all = composeConfig({
      react: true,
      node: true,
      strict: true,
      ai: true,
      oxlint: true,
    })
    const base = composeConfig({})
    expect(all.length).toBeGreaterThan(base.length + 10)
  })
})
