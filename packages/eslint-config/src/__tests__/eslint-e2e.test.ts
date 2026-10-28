/* eslint-disable security/detect-non-literal-fs-filename */
import { ESLint } from "eslint"
import { mkdirSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { describe, expect, it } from "vitest"

import type { ConfigOptions, FlatConfigArray } from "../types"

import { addRule } from "../api/rule-helpers"
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
`

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

  it("still lints TypeScript fenced blocks inside MDX", { timeout: 30_000 }, async () => {
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
