/* eslint-disable max-lines, max-lines-per-function, max-statements, max-params, complexity, sonarjs/cognitive-complexity -- Build-time code generator: inherently procedural with many sequential steps. Splitting would hurt readability. */
/**
 * Code generator — produces valid ES module strings for pre-generated ESLint
 * flat configs. Merges rules from the composed config array by matching file
 * patterns, then emits a JS module with real import statements, the resolved
 * rules (pure JSON) and the settings of global config blocks. Settings are
 * emitted as JSON, except for registered keys (see `settingExpressions`) whose
 * non-serializable values (e.g. resolver instances) are emitted as JS
 * expressions with their own imports.
 *
 * This replaces the old `serializeConfig()` approach that broke on
 * functions, class instances, and circular references.
 */
import picomatch from "picomatch"

import type { ConfigFlags, FlatConfig, FlatConfigArray } from "../types"

import {
  JAVASCRIPT_SOURCE_FILES,
  MARKDOWN_DOCUMENT_FILES,
  TYPESCRIPT_SOURCE_FILES,
} from "../file-patterns"
import { composeConfig } from "./compose"
import {
  pluginRegistry,
  type SettingExpression,
  settingExpressions,
  standaloneImports,
} from "./plugin-registry"

type Rules = Record<string, unknown>

/** File types to probe for effective rules by matching config patterns. */
const FILE_PROBES = {
  base: "example.ts",
  jsCompat: "example.js",
  markdownCodeBlocks: "guide.mdx/0.ts",
  tests: "example.test.ts",
  e2e: "example.spec.ts",
  stories: "example.stories.tsx",
  configFiles: "vite.config.ts",
  declarations: "example.d.ts",
  scripts: "scripts/example.ts",
} as const

/**
 * Generates a complete ES module string for a given set of config options.
 * The module exports a valid ESLint flat config array with real imports.
 */
export function generateConfigModule(opts: ConfigFlags): string {
  const config = composeConfig(opts)
  const resolved = resolveRulesForAllProbes(config)

  // Filter base rules: remove "off" rules (redundant — ESLint defaults to off)
  const baseRules = filterOffRules(resolved.base)

  // Compute diffs — each override only contains rules that differ from base
  const jsCompatDiff = computeRuleDiff(resolved.base, resolved.jsCompat)
  const markdownCodeBlocksDiff = computeRuleDiff(
    resolved.base,
    resolved.markdownCodeBlocks,
  )
  const testsDiff = computeRuleDiff(resolved.base, resolved.tests)
  const e2eDiff = computeRuleDiff(resolved.base, resolved.e2e)
  const storiesDiff = computeRuleDiff(resolved.base, resolved.stories)
  const configFilesDiff = computeRuleDiff(resolved.base, resolved.configFiles)
  const declarationsDiff = computeRuleDiff(resolved.base, resolved.declarations)
  const scriptsDiff = computeRuleDiff(resolved.base, resolved.scripts)

  // Collect namespaces from base rules (for base block plugins)
  const baseNamespaces = collectNamespaces(baseRules)

  // Collect all namespaces including overrides (for imports)
  const allRules: Rules = {
    ...baseRules,
    ...markdownCodeBlocksDiff,
    ...testsDiff,
    ...e2eDiff,
    ...storiesDiff,
  }
  const requiredNamespaces = collectNamespaces(allRules)

  // Determine which features are active based on options
  const hasReact = opts.react === true
  const hasNode = opts.node === true
  const hasOxlint = opts.oxlint === true

  // Settings from global blocks (e.g. perfectionist, import-x resolvers)
  const baseSettings = emitSettings(collectBaseSettings(config))

  // Build the import block (plugin imports plus imports needed by settings)
  const imports = [
    ...new Set([
      ...buildImports(requiredNamespaces, { hasReact, hasNode, hasOxlint }),
      ...baseSettings.imports,
    ]),
  ].sort()

  // Build the config blocks
  const blocks: string[] = [ "  // TypeScript parser setup", "  ...tseslint.configs.strictTypeChecked.slice(0, 2),", ""]

  // Main base block — all effective rules for JS/TS code files
  blocks.push(emitBaseBlock(baseRules, baseNamespaces, baseSettings.code, { hasReact, hasNode }))

  // 3. JS Compat — disable type-checked rules for .js files
  if (Object.keys(jsCompatDiff).length > 0) {
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/js-compat",
      [...JAVASCRIPT_SOURCE_FILES],
      jsCompatDiff,
    ))
  }

  // 4. Tests
  if (Object.keys(testsDiff).length > 0) {
    const testPlugins = collectOverridePlugins(testsDiff, baseNamespaces)
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/tests",
      ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
      testsDiff,
      testPlugins,
    ))
  }

  // 4b. Testing Library — always included (separate block for plugin registration)
  blocks.push(emitTestingLibraryBlock())

  // 5. E2E
  if (Object.keys(e2eDiff).length > 0) {
    const e2ePlugins = collectOverridePlugins(e2eDiff, baseNamespaces)
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/e2e",
      ["**/*.spec.ts"],
      e2eDiff,
      e2ePlugins,
    ))
  }

  // 6. Stories
  if (Object.keys(storiesDiff).length > 0) {
    const storiesPlugins = collectOverridePlugins(storiesDiff, baseNamespaces)
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/stories",
      ["**/*.stories.{ts,tsx}"],
      storiesDiff,
      storiesPlugins,
    ))
  }

  // 7. Config files
  if (Object.keys(configFilesDiff).length > 0) {
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/config-files",
      [
        "**/*.config.{ts,mts,cts,js,mjs,cjs}",
        "**/vite.config.*",
        "**/vitest.config.*",
        "**/next.config.*",
        "**/tailwind.config.*",
        "**/postcss.config.*",
      ],
      configFilesDiff,
    ))
  }

  // 8. Declarations
  if (Object.keys(declarationsDiff).length > 0) {
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/declarations",
      ["**/*.d.ts"],
      declarationsDiff,
    ))
  }

  // 9. Scripts
  if (Object.keys(scriptsDiff).length > 0) {
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/scripts",
      ["**/scripts/**/*.{ts,mts,js,mjs}"],
      scriptsDiff,
    ))
  }

  // 10. JSON (template block)
  blocks.push(emitJsonBlock())

  // 11. JSONC (template block)
  blocks.push(emitJsoncBlock())

  // 12. Package.json (template block)
  blocks.push(emitPackageJsonBlock())

  // 12b. Package.json AI rules (if ai mode)
  if (opts.ai) {
    blocks.push(emitPackageJsonAiBlock())
  }

  // 13. Markdown/MDX (template block)
  blocks.push(emitMarkdownBlock(markdownCodeBlocksDiff))

  // 14. OxLint (absolute last)
  if (hasOxlint) {
    blocks.push(emitOxlintBlock(opts))
  }

  // Build inline helper blocks (e.g. react-compat plugin)
  const helpers: string[] = []
  if (hasReact) {
    helpers.push(...emitReactCompatHelper())
  }

  // Assemble the module
  const lines = [
    "// Auto-generated by eslint-config-setup — do not edit",
    "// @ts-nocheck",
    ...imports,
    "",
    ...helpers,
    "export default [",
    ...blocks,
    "]",
    "",
  ]

  return lines.join("\n")
}

// ────────────────────────────────────────────────────────────────────────────
// Rule resolution via manual config merging
// ────────────────────────────────────────────────────────────────────────────

/**
 * Resolves the effective rules for each file probe by manually merging
 * config objects from the flat config array. This avoids ESLint's
 * `calculateConfigForFile()` which validates rule existence (and fails
 * when plugins have version mismatches).
 */
function resolveRulesForAllProbes(
  config: FlatConfigArray,
): Record<keyof typeof FILE_PROBES, Rules> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Populated for all keys in the loop below
  const result = {} as Record<keyof typeof FILE_PROBES, Rules>

  for (const [key, filename] of Object.entries(FILE_PROBES)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Key is always a valid FILE_PROBES key
    result[key as keyof typeof FILE_PROBES] = resolveRulesForFile(config, filename)
  }

  return result
}

/**
 * Merges rules from all config objects that match a given filename.
 * Skips configs with `language` (JSON, JSONC) or `processor` (markdown)
 * since those use different parsers.
 */
export function resolveRulesForFile(config: FlatConfigArray, filename: string): Rules {
  const merged: Rules = {}

  for (const block of config) {
    // Skip non-JS/TS configs (JSON, markdown, etc.)
    if (hasNonJsFields(block)) continue

    // Check if this block matches the filename
    if (!configMatchesFile(block, filename)) continue

    // Merge rules (later wins)
    if (block.rules) {
      for (const [rule, value] of Object.entries(block.rules)) {
        merged[rule] = value
      }
    }
  }

  return merged
}

/**
 * Checks if a config block has fields that indicate it's for non-JS/TS files
 * (JSON, JSONC, markdown, etc.).
 */
function hasNonJsFields(block: FlatConfig): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Checking dynamic properties on config block
  const b = block as Record<string, unknown>
  return b.language !== undefined || b.processor !== undefined
}

/**
 * Checks if a config block matches a given filename based on its `files`
 * and `ignores` patterns.
 */
function configMatchesFile(block: FlatConfig, filename: string): boolean {
  // If no `files` field, the config is global (matches all files)
  if (!block.files || block.files.length === 0) {
    // But check ignores
    if (block.ignores && block.ignores.length > 0) {
      const isIgnored = block.ignores.some(
        (pattern) => typeof pattern === "string" && picomatch(pattern)(filename),
      )
      if (isIgnored) return false
    }
    return true
  }

  // Check if filename matches any of the file patterns
  const filesMatch = block.files.some((pattern) => {
    if (typeof pattern === "string") {
      return picomatch(pattern)(filename)
    }
    return false
  })

  if (!filesMatch) return false

  // Check ignores
  if (block.ignores && block.ignores.length > 0) {
    const isIgnored = block.ignores.some(
      (pattern) => typeof pattern === "string" && picomatch(pattern)(filename),
    )
    if (isIgnored) return false
  }

  return true
}

// ────────────────────────────────────────────────────────────────────────────
// Settings collection and emission
// ────────────────────────────────────────────────────────────────────────────

type Settings = Record<string, unknown>

/**
 * Collects the settings of all fully global config blocks (no `files`,
 * `ignores`, `basePath`, `language` or `processor`) in composition order,
 * merged like ESLint's flat config: plain objects merge recursively, arrays
 * and all other values are replaced by the later block. Values are kept by
 * reference. See `deepMergeSettings` for the remaining differences.
 *
 * Settings on any other block cannot be represented in the generated base
 * block, so they are rejected instead of being silently dropped.
 */
export function collectBaseSettings(config: FlatConfigArray): Settings {
  let merged: Settings = {}

  for (const [index, block] of config.entries()) {
    const settings: unknown = block.settings
    if (!isPlainObject(settings)) continue

    if (!isGlobalBlock(block)) {
      if (Object.keys(settings).length === 0) continue
      const label = block.name === undefined ? `#${index}` : `"${block.name}"`
      throw new Error(
        `Config block ${label} defines settings but is not global (files, ignores, basePath, language or processor set). Generated configs only support settings on global blocks.`,
      )
    }

    merged = deepMergeSettings(merged, settings)
  }

  return merged
}

/**
 * Emits a settings object as JS source for the base block. JSON-serializable
 * values are emitted as JSON; keys registered in `mappings` are always emitted
 * as their expression, and the imports those expressions need are returned.
 *
 * @throws {Error} If a value is not JSON-serializable and has no mapping, or if a
 *   registered mapping key is missing from `settings`.
 */
export function emitSettings(
  settings: Settings,
  mappings: Readonly<Record<string, SettingExpression>> = settingExpressions,
): { code: string; imports: string[] } {
  const imports = new Set<string>()
  const entries: string[] = []

  for (const key of Object.keys(mappings)) {
    if (!Object.hasOwn(settings, key)) {
      throw new Error(`Setting expression registered for "${key}", but no config block defines this setting.`)
    }
  }

  for (const key of Object.keys(settings).sort()) {
    const value = settings[key]
    let code: string

    if (Object.hasOwn(mappings, key)) {
      const mapping = mappings[key]
      code = mapping.expression
      for (const statement of mapping.imports) {
        imports.add(statement)
      }
    } else if (isJsonSerializable(value)) {
      code = JSON.stringify(value, null, 2).replaceAll("\n", "\n  ")
    } else {
      throw new Error(
        `Setting "${key}" is not JSON-serializable. Register a setting expression for it in plugin-registry.ts.`,
      )
    }

    entries.push(`  ${JSON.stringify(key)}: ${code},`)
  }

  const body = entries.length === 0 ? "{}" : `{\n${entries.join("\n")}\n}`
  // Indent all lines except the first to match the base block (4 spaces)
  return { code: body.replaceAll("\n", "\n    "), imports: [...imports].sort() }
}

/**
 * A block is global when it applies to every file ESLint lints as JS/TS.
 *
 * `basePath` is checked here only, not in `hasNonJsFields`: the latter also
 * drives rule collection. Known limitation (non-goal): the *rules* of a
 * `basePath` block are still merged into the global base block, because
 * `resolveRulesForFile` and `configMatchesFile` ignore `basePath`. No composed
 * block uses `basePath` today.
 */
function isGlobalBlock(block: FlatConfig): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Checking dynamic properties on config block
  const b = block as Record<string, unknown>
  return (
    b.files === undefined &&
    b.ignores === undefined &&
    b.basePath === undefined &&
    !hasNonJsFields(block)
  )
}

/** Plain object: prototype is `Object.prototype` or `null` (no arrays, no class instances). */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false
  const proto: unknown = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Replicates ESLint's flat-config `deepMerge` for settings (no cloning).
 * Source values that are `undefined` keep the earlier value, as in ESLint, and
 * `__proto__` keys of a source are skipped.
 *
 * Remaining differences from ESLint's `deepMerge`:
 * - Only plain objects merge recursively. Class instances are replaced rather
 *   than merged; `emitSettings` rejects them later as not JSON-serializable
 *   unless a setting expression is registered for their key.
 * - A key whose only values are `undefined` stays absent instead of being set
 *   to `undefined`, which is equivalent at runtime.
 * - An own `__proto__` key inside a value kept by reference (or copied by the
 *   object spread below) is not removed. `isJsonSerializable` rejects it, so
 *   the build fails instead of silently dropping the key as ESLint does.
 */
function deepMergeSettings(target: Settings, source: Settings): Settings {
  const result: Settings = { ...target }
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || key === "__proto__") continue
    const existing = result[key]
    result[key] = isPlainObject(existing) && isPlainObject(value)
      ? deepMergeSettings(existing, value)
      : value
  }
  return result
}

/**
 * Recursively: null, boolean, finite number, string, array or plain object.
 * A plain object with an own `__proto__` key is rejected at any depth: emitted
 * into an object literal, it would set the prototype instead of creating a key.
 */
function isJsonSerializable(value: unknown): boolean {
  if (value === null || typeof value === "boolean" || typeof value === "string") return true
  if (typeof value === "number") return Number.isFinite(value)
  if (Array.isArray(value)) return value.every((item) => isJsonSerializable(item))
  if (isPlainObject(value)) {
    if (Object.hasOwn(value, "__proto__")) return false
    return Object.values(value).every((item) => isJsonSerializable(item))
  }
  return false
}

// ────────────────────────────────────────────────────────────────────────────
// Rule diffing
// ────────────────────────────────────────────────────────────────────────────

/**
 * Filters out rules set to "off" — they're redundant in the base block
 * since ESLint defaults to "off" for unconfigured rules.
 */
function filterOffRules(rules: Rules): Rules {
  const filtered: Rules = {}
  for (const [rule, value] of Object.entries(rules)) {
    const severity: unknown = Array.isArray(value) ? (value as unknown[])[0] : value
    if (severity !== "off" && severity !== 0) {
      filtered[rule] = value
    }
  }
  return filtered
}

/**
 * Computes the diff between two rule sets. Returns only rules that differ.
 * If `base` is empty ({}), returns all rules from `override` (used for
 * the initial base block).
 */
function computeRuleDiff(base: Rules, override: Rules): Rules {
  if (Object.keys(base).length === 0) {
    return { ...override }
  }

  const diff: Rules = {}

  // Rules in override that differ from base
  for (const [rule, value] of Object.entries(override)) {
    if (JSON.stringify(base[rule]) !== JSON.stringify(value)) {
      diff[rule] = value
    }
  }

  // Rules in base that are missing in override (turned off)
  for (const rule of Object.keys(base)) {
    if (!(rule in override)) {
      diff[rule] = "off"
    }
  }

  return diff
}

// ────────────────────────────────────────────────────────────────────────────
// Namespace collection
// ────────────────────────────────────────────────────────────────────────────

/**
 * Extracts all unique plugin namespaces from a rule set.
 * E.g. `@typescript-eslint/no-unused-vars` → `@typescript-eslint`
 */
function collectNamespaces(rules: Rules): Set<string> {
  const namespaces = new Set<string>()
  for (const ruleName of Object.keys(rules)) {
    const ns = extractNamespace(ruleName)
    if (ns !== null) {
      namespaces.add(ns)
    }
  }
  return namespaces
}

function extractNamespace(ruleName: string): null | string {
  // Scoped namespace: @scope/plugin/rule-name → @scope/plugin
  // Example: @typescript-eslint/no-unused-vars → @typescript-eslint
  // Example: @cspell/spellchecker → @cspell
  if (ruleName.startsWith("@")) {
    const scopeSlash = ruleName.indexOf("/")
    if (scopeSlash !== -1) {
      // Check for second slash (e.g. @typescript-eslint/no-unused-vars)
      return ruleName.slice(0, scopeSlash)
    }
    return null
  }
  // Regular namespace: plugin/rule-name → plugin
  const slashIndex = ruleName.indexOf("/")
  if (slashIndex !== -1) {
    return ruleName.slice(0, slashIndex)
  }
  // Built-in ESLint rule (no namespace)
  return null
}

// ────────────────────────────────────────────────────────────────────────────
// Import generation
// ────────────────────────────────────────────────────────────────────────────

function buildImports(
  namespaces: Set<string>,
  features: { hasReact: boolean; hasNode: boolean; hasOxlint: boolean },
): string[] {
  const imports = new Set<string>([standaloneImports.tseslint])

  // tseslint is always needed (parser setup)

  // Plugin imports based on rule namespaces
  for (const ns of namespaces) {
    if (ns in pluginRegistry) {
      imports.add(pluginRegistry[ns].importStatement)
    }
  }

  // Always-needed standalone imports
  imports.add(standaloneImports.mdxPlugin)
  imports.add(standaloneImports.packageJsonPlugin)

  // JSON plugin
  imports.add(pluginRegistry.json.importStatement)

  // Testing library is always included
  imports.add(pluginRegistry["testing-library"].importStatement)

  // Globals if react or node
  if (features.hasReact || features.hasNode) {
    imports.add(standaloneImports.globals)
  }

  // OxLint
  if (features.hasOxlint) {
    imports.add(standaloneImports.oxlintPlugin)
  }

  return [...imports].sort()
}

// ────────────────────────────────────────────────────────────────────────────
// Block emitters
// ────────────────────────────────────────────────────────────────────────────

function emitBaseBlock(
  rules: Rules,
  namespaces: Set<string>,
  settingsCode: string,
  features: { hasReact: boolean; hasNode: boolean },
): string {
  // Scoped to JS/TS code files: without `files`, the JS/TS rules would also
  // reach JSON files (and ```json fences in Markdown), which ESLint rejects
  // for the json/json and json/jsonc languages.
  const files = [...TYPESCRIPT_SOURCE_FILES, ...JAVASCRIPT_SOURCE_FILES]
  const lines: string[] = [
    "  // Base rules — all effective rules for JS/TS code files",
    "  {",
    '    name: "eslint-config-setup/base",',
    `    files: ${JSON.stringify(files)},`,
    // Redundant while `files` lists only code extensions; kept as a guard so
    // Markdown/MDX documents stay excluded if `files` is ever widened.
    `    ignores: ${JSON.stringify([...MARKDOWN_DOCUMENT_FILES])},`,
    "    plugins: {",
  ]

  // Plugins object
  for (const ns of [...namespaces].sort()) {
    if (ns in pluginRegistry) {
      lines.push(`      ${JSON.stringify(ns)}: ${pluginRegistry[ns].pluginExpr},`)
    }
  }
  lines.push("    },", "    languageOptions: {", "      parser: tseslint.parser,", "      parserOptions: {", "        projectService: true,")
  if (features.hasReact) {
    lines.push("        ecmaFeatures: { jsx: true },")
  }
  lines.push("      },")
  if (features.hasReact || features.hasNode) {
    lines.push("      globals: {")
    if (features.hasReact) {
      lines.push("        ...globals.browser,")
    }
    if (features.hasNode) {
      lines.push("        ...globals.node,")
    }
    lines.push("      },")
  }
  lines.push("    },")

  // Settings (shared by all files the base block applies to)
  lines.push(`    settings: ${settingsCode},`)

  // Rules
  lines.push(`    rules: ${indentJson(rules, 4)},`, "  },", "")

  return lines.join("\n")
}

function emitOverrideBlock(
  name: string,
  files: string[],
  rules: Rules,
  plugins?: Map<string, string>,
): string {
  const lines: string[] = []
  lines.push(`  // ${name.replace("eslint-config-setup/", "")} override`, "  {")
  lines.push(`    name: ${JSON.stringify(name)},`)
  lines.push(`    files: ${JSON.stringify(files)},`)

  if (plugins && plugins.size > 0) {
    lines.push("    plugins: {")
    for (const [ns, expr] of plugins) {
      lines.push(`      ${JSON.stringify(ns)}: ${expr},`)
    }
    lines.push("    },")
  }

  lines.push(`    rules: ${indentJson(rules, 4)},`, "  },", "")

  return lines.join("\n")
}

function emitTestingLibraryBlock(): string {
  return [
    "  // testing-library override",
    "  {",
    '    name: "eslint-config-setup/tests-testing-library",',
    '    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],',
    "    plugins: {",
    '      "testing-library": testingLibraryPlugin,',
    "    },",
    "    rules: {",
    '      "testing-library/await-async-events": "error",',
    '      "testing-library/await-async-queries": "error",',
    '      "testing-library/await-async-utils": "error",',
    '      "testing-library/no-await-sync-events": "error",',
    '      "testing-library/no-await-sync-queries": "error",',
    '      "testing-library/no-container": "error",',
    '      "testing-library/no-debugging-utils": "warn",',
    '      "testing-library/no-node-access": "error",',
    '      "testing-library/no-render-in-lifecycle": "error",',
    '      "testing-library/no-unnecessary-act": "error",',
    '      "testing-library/no-wait-for-multiple-assertions": "error",',
    '      "testing-library/no-wait-for-side-effects": "error",',
    '      "testing-library/prefer-find-by": "error",',
    '      "testing-library/prefer-presence-queries": "error",',
    '      "testing-library/prefer-query-by-disappearance": "error",',
    '      "testing-library/prefer-screen-queries": "error",',
    '      "testing-library/render-result-naming-convention": "error",',
    "    },",
    "  },",
    "",
  ].join("\n")
}

function emitJsonBlock(): string {
  return [
    "  // JSON linting",
    "  {",
    '    name: "eslint-config-setup/json",',
    '    files: ["**/*.json"],',
    '    ignores: ["**/package-lock.json"],',
    '    language: "json/json",',
    "    plugins: { json: jsonPlugin },",
    "    rules: {",
    '      "json/no-duplicate-keys": "error",',
    '      "json/no-empty-keys": "error",',
    '      "json/no-unsafe-values": "error",',
    '      "json/no-unnormalized-keys": "error",',
    "    },",
    "  },",
    "",
  ].join("\n")
}

function emitJsoncBlock(): string {
  return [
    "  // JSONC linting (tsconfig, vscode, turbo)",
    "  {",
    '    name: "eslint-config-setup/jsonc",',
    '    files: ["**/tsconfig.json", "**/tsconfig.*.json", "**/.vscode/*.json", "**/turbo.json"],',
    '    language: "json/jsonc",',
    "    plugins: { json: jsonPlugin },",
    "    rules: {",
    '      "json/no-duplicate-keys": "error",',
    '      "json/no-empty-keys": "error",',
    '      "json/no-unsafe-values": "error",',
    '      "json/no-unnormalized-keys": "error",',
    "    },",
    "  },",
    "",
  ].join("\n")
}

function emitPackageJsonBlock(): string {
  return [
    "  // Package.json validation",
    '  { ...packageJsonPlugin.configs.recommended, name: "eslint-config-setup/package-json" },',
    "",
  ].join("\n")
}

function emitPackageJsonAiBlock(): string {
  return [
    "  // Package.json AI rules",
    "  {",
    '    name: "eslint-config-setup/package-json-ai",',
    '    files: ["**/package.json"],',
    "    rules: {",
    '      "package-json/order-properties": "error",',
    '      "package-json/sort-collections": "error",',
    "    },",
    "  },",
    "",
  ].join("\n")
}

function emitMarkdownBlock(markdownCodeBlocksDiff: Rules): string {
  return [
    "  // Markdown/MDX parsing",
    "  {",
    "    ...mdxPlugin.flat,",
    "    processor: mdxPlugin.createRemarkProcessor({ lintCodeBlocks: true, languageMapper: {} }),",
    "  },",
    "  // Markdown/MDX code block linting",
    "  {",
    "    ...mdxPlugin.flatCodeBlocks,",
    "    languageOptions: {",
    "      ...mdxPlugin.flatCodeBlocks.languageOptions,",
    "      parserOptions: {",
    "        ...mdxPlugin.flatCodeBlocks.languageOptions?.parserOptions,",
    "        projectService: false,",
    "      },",
    "    },",
    "    rules: {",
    `      ...${indentJson(markdownCodeBlocksDiff, 6)},`,
    "      ...mdxPlugin.flatCodeBlocks.rules,",
    '      "eol-last": "off",',
    '      "no-undef": "off",',
    '      "no-unused-expressions": "off",',
    '      "no-unused-vars": "off",',
    '      "padded-blocks": "off",',
    '      strict: "off",',
    '      "unicode-bom": "off",',
    "    },",
    "  },",
    "",
  ].join("\n")
}

function emitOxlintBlock(opts: ConfigFlags): string {
  const lines: string[] = [ "  // OxLint integration — disables rules already covered by OxLint"]

  // Emit a spread that handles both plain objects and SplittedFlatConfig tuples
  // (eslint-plugin-oxlint ≥1.51.0 returns arrays from flat/* configs)
  const addSpread = (configName: string, blockName: string): void => {
    lines.push(`  ...[oxlintPlugin.configs[${JSON.stringify(configName)}]].flat().map((c, index, array) => ({ ...c, name: "eslint-config-setup/${blockName}" + (array.length > 1 ? "-" + (index + 1) : "") })),`)
  }

  addSpread("flat/recommended", "oxlint")
  if (opts.react) {
    addSpread("flat/react", "oxlint-react")
    addSpread("flat/jsx-a11y", "oxlint-jsx-a11y")
    addSpread("flat/react-hooks", "oxlint-react-hooks")
    if (opts.ai) {
      addSpread("flat/react-perf", "oxlint-react-perf")
    }
  }
  if (opts.node) {
    addSpread("flat/node", "oxlint-node")
  }
  addSpread("flat/typescript", "oxlint-typescript")
  addSpread("flat/unicorn", "oxlint-unicorn")
  addSpread("flat/import", "oxlint-import")
  addSpread("flat/jsdoc", "oxlint-jsdoc")
  lines.push("")

  return lines.join("\n")
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Collects plugins needed by an override block (plugins that are newly
 * introduced in the override but not in the base plugins set).
 */
function collectOverridePlugins(
  rules: Rules,
  baseNamespaces: Set<string>,
): Map<string, string> {
  const plugins = new Map<string, string>()
  for (const ruleName of Object.keys(rules)) {
    const ns = extractNamespace(ruleName)
    if (ns !== null && !baseNamespaces.has(ns) && ns in pluginRegistry) {
      plugins.set(ns, pluginRegistry[ns].pluginExpr)
    }
  }
  return plugins
}

/**
 * Converts a rules object to indented JSON string for embedding in JS code.
 */
function indentJson(obj: Rules, indent: number): string {
  const json = JSON.stringify(sortRules(obj), null, 2)
  const prefix = " ".repeat(indent)
  // Indent all lines except the first
  return json.replaceAll('\n', `\n${  prefix}`)
}

/**
 * Sorts rules alphabetically by name for deterministic output.
 */
/**
 * Emits inline JS that builds the react-compat plugin from `@eslint-react/eslint-plugin`.
 * Merges React-specific rule families into react/* and aliases legacy names for OxLint compat.
 */
function emitReactCompatHelper(): string[] {
  return [
    "// React compat plugin — maps @eslint-react rule families into the `react/` namespace",
    "// and aliases rules to legacy eslint-plugin-react names for OxLint compatibility.",
    "const reactCompatPlugin = (() => {",
    "  const core = eslintReactPlugin.rules",
    "  const select = (prefix) => Object.fromEntries(",
    "    Object.entries(core)",
    "      .filter(([name]) => name.startsWith(prefix))",
    "      .map(([name, rule]) => [name.slice(prefix.length), rule]),",
    "  )",
    '  const dom = select("dom-")',
    '  const jsx = select("jsx-")',
    '  const naming = select("naming-convention-")',
    '  const rsc = select("rsc-")',
    '  const webApi = select("web-api-")',
    "",
    "  // Legacy aliases: legacy name → [source, original name]",
    "  const aliases = {",
    '    "jsx-key": [core, "no-missing-key"],',
    '    "jsx-key-before-spread": [jsx, "no-key-after-spread"],',
    '    "jsx-no-constructed-context-values": [core, "no-unstable-context-value"],',
    '    "jsx-no-leaked-render": [core, "no-leaked-conditional-rendering"],',
    '    "jsx-no-useless-fragment": [jsx, "no-useless-fragment"],',
    '    "no-object-type-as-default-prop": [core, "no-unstable-default-props"],',
    '    "no-unstable-nested-components": [core, "no-nested-component-definitions"],',
    '    "display-name": [core, "no-missing-component-display-name"],',
    '    "forward-ref-uses-ref": [core, "no-forward-ref"],',
    '    "no-did-mount-set-state": [core, "no-set-state-in-component-did-mount"],',
    '    "no-did-update-set-state": [core, "no-set-state-in-component-did-update"],',
    '    "no-will-update-set-state": [core, "no-set-state-in-component-will-update"],',
    '    "hook-use-state": [core, "use-state"],',
    '    "no-danger": [dom, "no-dangerously-set-innerhtml"],',
    '    "no-danger-with-children": [dom, "no-dangerously-set-innerhtml-with-children"],',
    '    "no-find-dom-node": [dom, "no-find-dom-node"],',
    '    "no-namespace": [jsx, "no-namespace"],',
    '    "no-render-return-value": [dom, "no-render-return-value"],',
    '    "jsx-no-script-url": [dom, "no-script-url"],',
    '    "jsx-no-target-blank": [dom, "no-unsafe-target-blank"],',
    '    "no-unknown-property": [dom, "no-unknown-property"],',
    '    "void-dom-elements-no-children": [dom, "no-void-elements-with-children"],',
    '    "button-has-type": [dom, "no-missing-button-type"],',
    '    "iframe-missing-sandbox": [dom, "no-missing-iframe-sandbox"],',
    '    "style-prop-object": [dom, "no-string-style-prop"],',
    "  }",
    "",
    "  // Identical-name aliases (core rules where legacy name = @eslint-react name)",
    "  const identicalCore = [",
    '    "no-access-state-in-setstate", "no-array-index-key",',
    '    "no-direct-mutation-state",',
    '    "no-unused-class-component-members", "no-unused-state",',
    "  ]",
    '  for (const n of identicalCore) aliases[n] = [core, n]',
    '  aliases["no-children-prop"] = [jsx, "no-children-prop"]',
    '  aliases["jsx-no-comment-textnodes"] = [jsx, "no-comment-textnodes"]',
    "",
    "  // Build aliased originals set",
    "  const aliasedCore = new Set()",
    "  for (const [src, name] of Object.values(aliases)) {",
    "    if (src === core) aliasedCore.add(name)",
    '    else if (src === dom) aliasedCore.add("dom-" + name)',
    '    else if (src === jsx) aliasedCore.add("jsx-" + name)',
    '    else if (src === naming) aliasedCore.add("naming-convention-" + name)',
    '    else if (src === rsc) aliasedCore.add("rsc-" + name)',
    '    else if (src === webApi) aliasedCore.add("web-api-" + name)',
    "  }",
    "  const rules = {}",
    "",
    "  // Core rules (skip aliased originals)",
    "  for (const [n, r] of Object.entries(core)) { if (!aliasedCore.has(n)) rules[n] = r }",
    "",
    "  // Sub-plugin rules (skip aliased + prefer-namespace-import collision)",
    "  const subs = [[dom, new Set(['prefer-namespace-import'])], [jsx], [webApi], [naming], [rsc]]",
    "  for (const [src, skip] of subs) {",
    "    for (const [n, r] of Object.entries(src)) {",
    "      if (skip && skip.has(n)) continue",
    "      if (Object.values(aliases).some(([s, o]) => s === src && o === n)) continue",
    "      rules[n] = r",
    "    }",
    "  }",
    "",
    "  // Add legacy aliases",
    "  for (const [legacy, [src, orig]] of Object.entries(aliases)) rules[legacy] = src[orig]",
    "",
    '  return { meta: { name: "react-compat", version: "1.0.0" }, rules }',
    "})()",
    "",
  ]
}

function sortRules(rules: Rules): Rules {
  const sorted: Rules = {}
  for (const key of Object.keys(rules).sort()) {
    sorted[key] = rules[key]
  }
  return sorted
}
