/* eslint-disable security/detect-non-literal-fs-filename */
import { execSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

import type { OxlintConfigOptions } from "../types"

import { composeConfig } from "../build/compose"
import { serializeOxlintConfig } from "../build/serialize"

/** Use pnpm exec to run oxlint — works cross-platform and only uses locally installed packages. */
const OXLINT_CMD = "pnpm exec oxlint"

/** Minimal valid TS file that oxlint should accept without errors. */
const FIXTURE = `const greeting: string = "hello"\nconsole.log(greeting)\n`

/** All meaningful option permutations (mirrors the generate script). */
const PERMUTATIONS: Array<{ label: string; opts: OxlintConfigOptions }> = [
  { label: "base", opts: {} },
  { label: "react", opts: { react: true } },
  { label: "node", opts: { node: true } },
  { label: "ai", opts: { ai: true } },
  { label: "react + node", opts: { react: true, node: true } },
  { label: "react + ai", opts: { react: true, ai: true } },
  { label: "node + ai", opts: { node: true, ai: true } },
  { label: "all flags", opts: { react: true, node: true, ai: true } },
]

describe("oxlint E2E — generated configs are valid", async () => {
  const migrateModule = await import("@oxlint/migrate")
  const migrate = migrateModule.default

  for (const { label, opts } of PERMUTATIONS) {
    it(`oxlint accepts generated config: ${label}`, { timeout: 30_000 }, async () => {
      // 1. Generate the oxlint config the same way the build does
      const eslintConfig = composeConfig({ ...opts, oxlint: false })
      const oxlintConfig = await migrate(eslintConfig)
      const configJson = serializeOxlintConfig(oxlintConfig)

      // 2. Write config + fixture to a temp dir
      const dir = path.join(tmpdir(), `oxlint-e2e-${Date.now()}-${label.replaceAll(" ", "-")}`)
      mkdirSync(dir, { recursive: true })

      const configPath = path.join(dir, ".oxlintrc.json")
      const fixturePath = path.join(dir, "test.ts")
      writeFileSync(configPath, configJson)
      writeFileSync(fixturePath, FIXTURE)

      // 3. Run oxlint — it should parse the config without errors
      //    Exit code 0 = success, exit code 1 = lint warnings/errors (acceptable),
      //    exit code 2 = config/parse failure (should not happen)
      let exitCode = 0
      let stderr = ""
      try {
        execSync(`${OXLINT_CMD} -c "${configPath}" "${fixturePath}"`, {
          timeout: 10_000,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        })
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const execError = error as { status: number; stderr: string }
        exitCode = execError.status
        stderr = execError.stderr
      }

      // oxlint uses exit code 2 for config errors
      expect(exitCode, `oxlint failed with exit code ${exitCode}\nstderr: ${stderr}`).not.toBe(2)
      expect(stderr).not.toMatch(/invalid|error.*config|parse.*fail|unknown field/i)
    })
  }
})
