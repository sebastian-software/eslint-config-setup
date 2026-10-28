/* eslint-disable security/detect-non-literal-fs-filename */
import { ESLint } from "eslint"
import { mkdirSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

import type { ConfigOptions } from "../types"

import { generateConfigModule } from "../build/codegen"

/** Minimal valid TS file — should not trigger fatal config errors. */
const FIXTURE_TS = `const greeting: string = "hello"\nconsole.log(greeting)\n`
const FIXTURE_MDX = `# Hello

export const Demo = () => <button type="button">Go</button>
`
const FIXTURE_MDX_TS_BLOCK = `# Types

\`\`\`typescript
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

/**
 * node_modules root so that the generated eslint.config.js can resolve
 * all plugin imports. We symlink from the temp dir into the real one.
 */
const NODE_MODULES = path.resolve(import.meta.dirname, "../../node_modules")

function linkPackageNodeModules(dir: string): void {
  const nodeModules = path.join(dir, "node_modules")
  mkdirSync(nodeModules, { recursive: true })

  for (const entry of readdirSync(NODE_MODULES, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue
    }

    const source = path.join(NODE_MODULES, entry.name)

    if (entry.name.startsWith("@")) {
      const scopeDir = path.join(nodeModules, entry.name)
      mkdirSync(scopeDir, { recursive: true })

      for (const scopedEntry of readdirSync(source, { withFileTypes: true })) {
        const scopedSource = path.join(source, scopedEntry.name)
        symlinkSync(
          realpathSync(scopedSource),
          path.join(scopeDir, scopedEntry.name),
          "junction",
        )
      }

      continue
    }

    symlinkSync(realpathSync(source), path.join(nodeModules, entry.name), "junction")
  }
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
    })
  }
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
    expect(result.messages.some((message) => message.ruleId === "no-var")).toBe(
      true,
    )
    expect(
      result.messages.some((message) => message.ruleId === "json/no-duplicate-keys"),
    ).toBe(true)
  })
})
