/* eslint-disable security/detect-non-literal-fs-filename */
import { ESLint } from "eslint"
import { mkdirSync, realpathSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { describe, expect, it } from "vitest"

import type { ConfigOptions, FlatConfigArray } from "../types"

import { addRule } from "../api/rule-helpers"
import { generateConfigModule } from "../build/codegen"
import { linkPackageNodeModules } from "./helpers/link-node-modules"

/** Minimal valid TS file — should not trigger fatal config errors. */
const FIXTURE_TS = `const greeting: string = "hello"\nconsole.log(greeting)\n`
const FIXTURE_MDX = `# Hello

export const Demo = () => <button type="button">Go</button>
`
const FIXTURE_MDX_TS_BLOCK = `# Types

\`\`\`typescript
import { x } from "./missing"
var greeting: string = "hello"
\`\`\`

\`\`\`json
{ "key": 1, "key": 2 }
\`\`\`
`

/**
 * Flat multi-extension fixture: every JS/TS extension ESLint lints today, plus
 * JSON files that must only receive JSON rules. Each basename appears once per
 * extension family because TypeScript drops a JS file that shares a basename
 * with a TS file. No generated block matches `comp.jsx`, so it is not linted.
 */
const MULTI_EXTENSION_FIXTURE: Record<string, string> = {
  "package.json": `${JSON.stringify({ name: "fixture", version: "1.0.0", private: true, type: "module" }, null, 2)}\n`,
  "tsconfig.json": `${JSON.stringify(
    {
      compilerOptions: { strict: true, allowJs: true, jsx: "react-jsx" },
      include: ["*.ts", "*.tsx", "*.mts", "*.cts", "*.js", "*.mjs", "*.cjs"],
      exclude: ["eslint.config.js"],
    },
    null,
    2,
  )}\n`,
  "data.json": `{ "value": 1 }\n`,
  "test.ts": "export const value = 1\n",
  "comp.tsx": "export const element = <div />\n",
  "mod.mts": "export const moduleValue = 1\n",
  "mod.cts": "export const commonValue = 1\n",
  "plain.js": "export const plainValue = 1\n",
  "esm.mjs": "export const esmValue = 1\n",
  "common.cjs": "module.exports = { commonJsValue: 1 }\n",
  "comp.jsx": "export const jsxElement = <div />\n",
}

const EXPECTED_LINTED_FILES = [
  "common.cjs",
  "comp.tsx",
  "data.json",
  "esm.mjs",
  "mod.cts",
  "mod.mts",
  "package.json",
  "plain.js",
  "test.ts",
  "tsconfig.json",
]

const EXPECTED_JSON_RULE_NAMESPACES: Record<string, string[]> = {
  "data.json": ["json"],
  "package.json": ["json", "package-json"],
  "tsconfig.json": ["json"],
}

function ruleNamespace(ruleName: string): string {
  const separator = ruleName.lastIndexOf("/")
  return separator === -1 ? "core" : ruleName.slice(0, separator)
}

function hasRules(config: unknown): config is { rules: Record<string, unknown> } {
  return (
    typeof config === "object"
    && config !== null
    && "rules" in config
    && typeof config.rules === "object"
    && config.rules !== null
  )
}

/** Namespaces of enabled rules; calculateConfigForFile normalizes severity to 0/1/2. */
function enabledRuleNamespaces(config: unknown): string[] {
  const namespaces = new Set<string>()

  for (const [name, entry] of Object.entries(hasRules(config) ? config.rules : {})) {
    if (Array.isArray(entry) && entry[0] !== 0) {
      namespaces.add(ruleNamespace(name))
    }
  }

  return [...namespaces].sort()
}

/** Writes files into a fresh temp project, links node_modules, lints and returns messages per file. */
async function lintProject({
  files,
  label,
  lint,
  opts,
}: {
  files: Record<string, string>
  label: string
  lint: string[]
  opts: ConfigOptions
}): Promise<Map<string, Array<{ fatal?: boolean; message: string; ruleId: null | string }>>> {
  // Real path: on macOS tmpdir() is a symlink (/var → /private/var), and
  // import-x compares resolved real paths when it detects cycles.
  const dir = path.join(
    realpathSync(tmpdir()),
    `eslint-e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  )
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, "eslint.config.js"), generateConfigModule(opts))
  writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { strict: true }, include: ["*.ts"] }),
  )
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), content)
  }
  linkPackageNodeModules(dir)

  const eslint = new ESLint({
    cwd: dir,
    overrideConfig: [{ languageOptions: { parserOptions: { tsconfigRootDir: dir } } }],
  })
  const results = await eslint.lintFiles(lint.map((name) => path.join(dir, name)))
  return new Map(results.map((r) => [path.basename(r.filePath), r.messages]))
}

/** All 16 option permutations. */
const PERMUTATIONS: Array<{ label: string; opts: ConfigOptions }> = [
  { label: "base", opts: {} },
  { label: "react", opts: { react: true } },
  { label: "node", opts: { node: true } },
  { label: "ai", opts: { ai: true } },
  { label: "oxlint", opts: { oxlint: true } },
  { label: "react + node", opts: { react: true, node: true } },
  { label: "react + ai", opts: { react: true, ai: true } },
  { label: "react + oxlint", opts: { react: true, oxlint: true } },
  { label: "node + ai", opts: { node: true, ai: true } },
  { label: "node + oxlint", opts: { node: true, oxlint: true } },
  { label: "ai + oxlint", opts: { ai: true, oxlint: true } },
  { label: "react + node + ai", opts: { react: true, node: true, ai: true } },
  { label: "react + node + oxlint", opts: { react: true, node: true, oxlint: true } },
  { label: "react + ai + oxlint", opts: { react: true, ai: true, oxlint: true } },
  { label: "node + ai + oxlint", opts: { node: true, ai: true, oxlint: true } },
  { label: "all flags", opts: { react: true, node: true, ai: true, oxlint: true } },
]

describe("ESLint E2E — generated configs load without fatal errors", () => {
  for (const { label, opts } of PERMUTATIONS) {
    it(`ESLint accepts generated config: ${label}`, { timeout: 30_000 }, async () => {
      // 1. Generate the config module (same as the build/publish step)
      const moduleSource = generateConfigModule(opts)

      // 2. Write config + fixture + tsconfig to a temp project
      const dir = path.join(tmpdir(), `eslint-e2e-${Date.now()}-${label.replaceAll(" ", "-")}`)
      mkdirSync(dir, { recursive: true })

      writeFileSync(path.join(dir, "eslint.config.js"), moduleSource)
      writeFileSync(path.join(dir, "test.ts"), FIXTURE_TS)
      writeFileSync(
        path.join(dir, "tsconfig.json"),
        JSON.stringify({ compilerOptions: { strict: true }, include: ["*.ts"] }),
      )

      // Link direct package targets so plugin imports resolve on Windows too.
      // A single node_modules junction preserves pnpm's relative symlink chain,
      // which points at the wrong location when the temp project lives elsewhere.
      linkPackageNodeModules(dir)

      // 3. Run ESLint with the generated config — just like a real user.
      //    Override tsconfigRootDir to pin the project service to this dir
      //    (avoids cross-contamination between parallel temp dirs).
      const eslint = new ESLint({
        cwd: dir,
        overrideConfig: [
          {
            languageOptions: {
              parserOptions: {
                tsconfigRootDir: dir,
              },
            },
          },
        ],
      })
      const results = await eslint.lintFiles([path.join(dir, "test.ts")])

      expect(results).toHaveLength(1)

      // Fatal errors indicate broken config (unknown rules, bad plugin, etc.)
      const fatal = results[0].messages.filter((m) => m.fatal)
      expect(
        fatal,
        `Fatal errors:\n${fatal.map((m) => `  ${m.message}`).join("\n")}`,
      ).toHaveLength(0)

      // Resolver misconfiguration surfaces as non-fatal "Resolve error" messages
      const resolveErrors = results[0].messages.filter((m) => m.message.startsWith("Resolve error"))
      expect(
        resolveErrors,
        `Resolve errors:\n${resolveErrors.map((m) => `  ${m.message}`).join("\n")}`,
      ).toHaveLength(0)
    })
  }
})

describe("ESLint E2E — settings reach the generated config", () => {
  const CYCLE_PERMUTATIONS: Array<{ label: string; opts: ConfigOptions }> = [
    { label: "base", opts: {} },
    { label: "node", opts: { node: true } },
  ]

  for (const { label, opts } of CYCLE_PERMUTATIONS) {
    it(`reports import/no-cycle for circular imports only: ${label}`, { timeout: 60_000 }, async () => {
      const messages = await lintProject({ label: `cycle-${label}`, opts, lint: ["a.ts", "e.ts"], files: {
        "a.ts": `import { b } from "./b"\nexport const a = (): number => b() + 1\n`,
        "b.ts": `import { a } from "./a"\nexport const b = (): number => a() + 1\n`,
        "d.ts": `export const d = (): number => 1\n`,
        "e.ts": `import { d } from "./d"\nexport const e = (): number => d() + 1\n`,
      } })

      expect(messages.get("a.ts")?.some((m) => m.ruleId === "import/no-cycle")).toBe(true)
      expect(messages.get("e.ts")?.some((m) => m.ruleId === "import/no-cycle")).toBe(false)
    })
  }

  it("applies natural sort order to object keys (ai)", { timeout: 60_000 }, async () => {
    const messages = await lintProject({ label: "natural-objects", opts: { ai: true }, lint: ["sorted.ts", "unsorted.ts"], files: {
      "sorted.ts": `export const sorted = { item2: 1, item10: 2 }\n`,
      "unsorted.ts": `export const unsorted = { item10: 1, item2: 2 }\n`,
    } })

    expect(messages.get("sorted.ts")?.some((m) => m.ruleId === "perfectionist/sort-objects")).toBe(false)
    expect(messages.get("unsorted.ts")?.some((m) => m.ruleId === "perfectionist/sort-objects")).toBe(true)
  })

  it("applies natural sort order to named imports", { timeout: 60_000 }, async () => {
    const messages = await lintProject({ label: "natural-imports", opts: {}, lint: ["sorted.ts", "unsorted.ts"], files: {
      "x.ts": `export const item2 = 1\nexport const item10 = 2\n`,
      "sorted.ts": `import { item2, item10 } from "./x"\n\nexport const sorted = item2 + item10\n`,
      "unsorted.ts": `import { item10, item2 } from "./x"\n\nexport const unsorted = item2 + item10\n`,
    } })

    expect(messages.get("sorted.ts")?.some((m) => m.ruleId === "perfectionist/sort-named-imports")).toBe(false)
    expect(messages.get("unsorted.ts")?.some((m) => m.ruleId === "perfectionist/sort-named-imports")).toBe(true)
  })
})

describe("ESLint E2E — base block stays on JS/TS files", () => {
  for (const { label, opts } of PERMUTATIONS) {
    it(`lints JSON and every JS/TS extension without fatal errors: ${label}`, { timeout: 60_000 }, async () => {
      const moduleSource = generateConfigModule(opts)
      const dir = path.join(tmpdir(), `eslint-files-e2e-${Date.now()}-${label.replaceAll(" ", "-")}`)
      mkdirSync(dir, { recursive: true })

      writeFileSync(path.join(dir, "eslint.config.js"), moduleSource)
      for (const [fileName, content] of Object.entries(MULTI_EXTENSION_FIXTURE)) {
        writeFileSync(path.join(dir, fileName), content)
      }

      linkPackageNodeModules(dir)

      const eslint = new ESLint({
        cwd: dir,
        overrideConfig: [
          // Keep the generated config itself out of the type-checked lint run.
          { ignores: ["eslint.config.js"] },
          {
            languageOptions: {
              parserOptions: {
                tsconfigRootDir: dir,
              },
            },
          },
        ],
      })
      const results = await eslint.lintFiles(["."])

      const fatal = results.flatMap((result) =>
        result.messages
          .filter((message) => message.fatal)
          .map((message) => `  ${path.basename(result.filePath)}: ${message.message}`),
      )
      expect(fatal, `Fatal errors:\n${fatal.join("\n")}`).toHaveLength(0)

      const linted = results.map((result) => path.basename(result.filePath)).sort()
      expect(linted).toStrictEqual(EXPECTED_LINTED_FILES)

      const jsonFiles = Object.keys(EXPECTED_JSON_RULE_NAMESPACES)
      const namespaces = await Promise.all(
        jsonFiles.map(async (fileName) =>
          enabledRuleNamespaces(await eslint.calculateConfigForFile(path.join(dir, fileName))),
        ),
      )
      expect(
        Object.fromEntries(jsonFiles.map((fileName, index) => [fileName, namespaces[index]])),
      ).toStrictEqual(EXPECTED_JSON_RULE_NAMESPACES)
    })
  }
})

describe("ESLint E2E — MDX handling", () => {
  const MDX_PERMUTATIONS: Array<{ label: string; opts: ConfigOptions }> = [
    { label: "base", opts: {} },
    { label: "react", opts: { react: true } },
    { label: "ai", opts: { ai: true } },
    { label: "react + ai", opts: { react: true, ai: true } },
  ]

  for (const { label, opts } of MDX_PERMUTATIONS) {
    it(`does not fatal on MDX documents: ${label}`, { timeout: 30_000 }, async () => {
      const moduleSource = generateConfigModule(opts)
      const dir = path.join(tmpdir(), `eslint-mdx-e2e-${Date.now()}-${label.replaceAll(" ", "-")}`)
      mkdirSync(dir, { recursive: true })

      writeFileSync(path.join(dir, "eslint.config.js"), moduleSource)
      writeFileSync(path.join(dir, "test.mdx"), FIXTURE_MDX)
      writeFileSync(
        path.join(dir, "tsconfig.json"),
        JSON.stringify({ compilerOptions: { jsx: "react-jsx", strict: true }, include: ["*.ts", "*.tsx"] }),
      )

      linkPackageNodeModules(dir)

      const eslint = new ESLint({
        cwd: dir,
        overrideConfig: [
          {
            languageOptions: {
              parserOptions: {
                tsconfigRootDir: dir,
              },
            },
          },
        ],
      })
      const results = await eslint.lintFiles([path.join(dir, "test.mdx")])

      expect(results).toHaveLength(1)
      const fatal = results[0].messages.filter((m) => m.fatal)
      expect(
        fatal,
        `Fatal errors:\n${fatal.map((m) => `  ${m.message}`).join("\n")}`,
      ).toHaveLength(0)
    })
  }

  it("still lints TypeScript and JSON fenced blocks inside MDX", { timeout: 30_000 }, async () => {
    const moduleSource = generateConfigModule({})
    const dir = path.join(tmpdir(), `eslint-mdx-code-blocks-${Date.now()}`)
    mkdirSync(dir, { recursive: true })

    writeFileSync(path.join(dir, "eslint.config.js"), moduleSource)
    writeFileSync(path.join(dir, "test.mdx"), FIXTURE_MDX_TS_BLOCK)
    writeFileSync(
      path.join(dir, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { strict: true }, include: ["*.ts"] }),
    )

    linkPackageNodeModules(dir)

    const eslint = new ESLint({
      cwd: dir,
      overrideConfig: [
        {
          languageOptions: {
            parserOptions: {
              tsconfigRootDir: dir,
            },
          },
        },
      ],
    })
    const results = await eslint.lintFiles([path.join(dir, "test.mdx")])
    const result = results[0]

    const fatal = result.messages.filter((message) => message.fatal)
    expect(fatal).toHaveLength(0)
    expect(result.messages.filter((message) => message.message.startsWith("Resolve error"))).toHaveLength(0)
    expect(result.messages.some((message) => message.ruleId === "no-var")).toBe(
      true,
    )
    expect(
      result.messages.some((message) => message.ruleId === "json/no-duplicate-keys"),
    ).toBe(true)
  })
})

/** Write a generated react config plus a README into a fresh temp project. */
function setupReactProject(): string {
  const dir = path.join(tmpdir(), `eslint-add-rule-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(dir, { recursive: true })

  writeFileSync(path.join(dir, "eslint.config.js"), generateConfigModule({ react: true }))
  writeFileSync(path.join(dir, "README.md"), "# Hello\n")
  writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { strict: true }, include: ["*.ts"] }),
  )

  linkPackageNodeModules(dir)
  return dir
}

function isFlatConfigArray(value: unknown): value is FlatConfigArray {
  return Array.isArray(value)
}

/** Load the generated config in-process; each temp dir yields a fresh array. */
async function importConfig(dir: string): Promise<FlatConfigArray> {
  const mod: unknown = await import(pathToFileURL(path.join(dir, "eslint.config.js")).href)
  if (mod == null || typeof mod !== "object" || !("default" in mod) || !isFlatConfigArray(mod.default)) {
    throw new TypeError("Generated config module has no default export array")
  }
  return mod.default
}

function createESLint(dir: string, config: FlatConfigArray): ESLint {
  return new ESLint({
    cwd: dir,
    overrideConfigFile: true,
    overrideConfig: [
      ...config,
      { languageOptions: { parserOptions: { tsconfigRootDir: dir } } },
    ],
  })
}

describe("ESLint E2E — addRule on generated configs", () => {
  it("unscoped addRule with a plugin rule does not break Markdown linting", { timeout: 30_000 }, async () => {
    const dir = setupReactProject()
    const readme = path.join(dir, "README.md")

    // addRule targets the eslint-config-setup/base block,
    // which registers the react plugin.
    const config = await importConfig(dir)
    addRule(config, "react/display-name", "error")

    const eslint = createESLint(dir, config)
    const results = await eslint.lintFiles([readme])
    expect(results).toHaveLength(1)
    expect(results[0].filePath).toBe(readme)
    expect(results[0].messages.some((m) => /ignored/i.test(m.message))).toBe(false)
    const fatal = results[0].messages.filter((m) => m.fatal)
    expect(
      fatal,
      `Fatal errors:\n${fatal.map((m) => `  ${m.message}`).join("\n")}`,
    ).toHaveLength(0)

    // The added rule is still active on code files.
    const tsxConfig: unknown = await eslint.calculateConfigForFile(path.join(dir, "x.tsx"))
    expect(tsxConfig).toHaveProperty(["rules", "react/display-name"])
  })

  it("control: a plugin rule on typescript-eslint/base breaks Markdown linting", { timeout: 30_000 }, async () => {
    const dir = setupReactProject()
    const readme = path.join(dir, "README.md")

    // The same rule on typescript-eslint/base (index 0, no files, no react
    // plugin) leaks to Markdown and makes ESLint throw.
    const controlConfig = await importConfig(dir)
    // Replace the element instead of mutating it: typescript-eslint/base is the
    // module-cached object exported by typescript-eslint and shared per worker.
    const idx = controlConfig.findIndex((b) => b.name === "typescript-eslint/base")
    expect(idx).toBeGreaterThanOrEqual(0)
    controlConfig[idx] = {
      ...controlConfig[idx],
      rules: { ...controlConfig[idx].rules, "react/display-name": "error" },
    }

    await expect(createESLint(dir, controlConfig).lintFiles([readme])).rejects.toThrow(
      /could not find plugin "react"/i,
    )
  })
})
