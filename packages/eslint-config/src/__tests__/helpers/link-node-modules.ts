/* eslint-disable security/detect-non-literal-fs-filename */
import { mkdirSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

/**
 * node_modules root so that the generated eslint.config.js can resolve
 * all plugin imports. We symlink from the temp dir into the real one.
 */
const NODE_MODULES = path.resolve(import.meta.dirname, "../../../node_modules")

/** Source file the generated configs' `eslint-config-setup/import-resolvers` import resolves to. */
const IMPORT_RESOLVERS_SOURCE = path.resolve(
  import.meta.dirname,
  "../../configs/import-resolvers.ts",
)

/**
 * Generated configs import `createImportXResolvers` from
 * `eslint-config-setup/import-resolvers`. Tests run before `pnpm build`, so
 * instead of depending on dist/ we install a stub package that re-exports the
 * TS source (loaded via Node's native type stripping).
 */
function writeImportResolversStub(dir: string): void {
  const stubDir = path.join(dir, "node_modules", "eslint-config-setup")
  mkdirSync(stubDir, { recursive: true })
  writeFileSync(
    path.join(stubDir, "package.json"),
    JSON.stringify({
      name: "eslint-config-setup",
      type: "module",
      exports: { "./import-resolvers": "./import-resolvers.js" },
    }),
  )
  writeFileSync(
    path.join(stubDir, "import-resolvers.js"),
    `export { createImportXResolvers } from ${JSON.stringify(pathToFileURL(IMPORT_RESOLVERS_SOURCE).href)}\n`,
  )
}

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

    if (entry.name === "eslint-config-setup") {
      continue
    }

    symlinkSync(realpathSync(source), path.join(nodeModules, entry.name), "junction")
  }

  writeImportResolversStub(dir)
}
