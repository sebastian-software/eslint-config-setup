import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript"
import { createNodeResolver } from "eslint-plugin-import-x"

/** A resolver instance accepted by the `import-x/resolver-next` setting. */
export type ImportXResolver =
  | ReturnType<typeof createNodeResolver>
  | ReturnType<typeof createTypeScriptImportResolver>

/**
 * Creates the resolver chain for `import-x/resolver-next`: TypeScript-aware
 * resolution first (tsconfig paths, `.ts` sources for `.js` specifiers),
 * then plain Node resolution as fallback.
 *
 * Shared by the composed config (`importsConfig()`) and the generated config
 * modules, which import it from the minimal `eslint-config-setup/import-resolvers`
 * entry (built from this file only), so resolver options cannot drift between
 * the two. `eslint-config-setup/modules` re-exports it as well.
 *
 * Note: this file is loaded via Node's native type stripping in the e2e
 * tests — keep it free of relative imports and non-erasable TS syntax.
 */
export function createImportXResolvers(): ImportXResolver[] {
  return [createTypeScriptImportResolver(), createNodeResolver()]
}
