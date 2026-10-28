/* eslint-disable security/detect-non-literal-fs-filename */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"

import type { ConfigFlags, FlatConfigArray } from "../../types"

import { generateConfigModule } from "../../build/codegen"
import { linkPackageNodeModules } from "./link-node-modules"

/** Temp directories created through this module (per test file, as vitest isolates modules). */
const createdTempDirs = new Set<string>()

/** Creates a fresh temp directory under os.tmpdir() and tracks it for `removeTempDirs()`. */
export function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), `${prefix}-`))
  createdTempDirs.add(dir)
  return dir
}

/** Removes every temp directory created by `makeTempDir` or `loadGeneratedConfig`. Call it in `afterAll`. */
export function removeTempDirs(): void {
  for (const dir of createdTempDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
  createdTempDirs.clear()
}

/**
 * Generates the config module for `opts` into a fresh temp dir (never into
 * `src/configs/`), links node_modules so plugin imports resolve and imports it.
 * The temp dir is returned and tracked for `removeTempDirs()`.
 */
export async function loadGeneratedConfig(
  opts: ConfigFlags,
): Promise<{ config: FlatConfigArray; dir: string }> {
  const dir = makeTempDir("eslint-config-setup-generated")
  const file = path.join(dir, "eslint.config.js")
  writeFileSync(file, generateConfigModule(opts))
  linkPackageNodeModules(dir)
  const mod: { default: FlatConfigArray } = await import(/* @vite-ignore */ pathToFileURL(file).href)
  return { config: mod.default, dir }
}
