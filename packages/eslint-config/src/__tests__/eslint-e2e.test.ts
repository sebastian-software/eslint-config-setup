/* eslint-disable @typescript-eslint/no-unsafe-call, security/detect-non-literal-fs-filename */
import { ESLint } from "eslint"
import { mkdirSync, symlinkSync, writeFileSync } from "node:fs"
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
`

/**
 * node_modules root so that the generated eslint.config.js can resolve
 * all plugin imports. We symlink from the temp dir into the real one.
 */
const NODE_MODULES = path.resolve(import.meta.dirname, "../../node_modules")

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

      // Link node_modules so plugin imports resolve.
      // Use "junction" on Windows (no admin rights needed), symlink elsewhere.
      symlinkSync(NODE_MODULES, path.join(dir, "node_modules"), "junction")

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

      symlinkSync(NODE_MODULES, path.join(dir, "node_modules"), "junction")

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

    symlinkSync(NODE_MODULES, path.join(dir, "node_modules"), "junction")

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
