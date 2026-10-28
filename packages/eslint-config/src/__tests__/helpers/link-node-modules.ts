/* eslint-disable security/detect-non-literal-fs-filename */
import { mkdirSync, readdirSync, realpathSync, symlinkSync } from "node:fs"
import path from "node:path"

/**
 * node_modules root so that the generated eslint.config.js can resolve
 * all plugin imports. We symlink from the temp dir into the real one.
 */
const NODE_MODULES = path.resolve(import.meta.dirname, "../../../node_modules")

export function linkPackageNodeModules(dir: string): void {
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
