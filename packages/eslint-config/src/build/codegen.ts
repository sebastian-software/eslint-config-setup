/**
 * Code generator — produces valid ES module strings for pre-generated ESLint
 * flat configs. Merges rules from the composed config array by matching file
 * patterns, then emits a JS module with real import statements and only the
 * resolved rules (pure JSON).
 *
 * This replaces the old `serializeConfig()` approach that broke on
 * functions, class instances, and circular references.
 */
import picomatch from "picomatch"

import type { ConfigOptions, FlatConfig, FlatConfigArray } from "../types"

import { composeConfig } from "./compose"
import { pluginRegistry, standaloneImports } from "./plugin-registry"

type Rules = Record<string, unknown>

/** File types to probe for effective rules by matching config patterns. */
const FILE_PROBES = {
  base: "example.ts",
  jsCompat: "example.js",
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
export async function generateConfigModule(opts: ConfigOptions): Promise<string> {
  const config = composeConfig(opts)
  const resolved = resolveRulesForAllProbes(config)

  // Filter base rules: remove "off" rules (redundant — ESLint defaults to off)
  const baseRules = filterOffRules(resolved.base)

  // Compute diffs — each override only contains rules that differ from base
  const jsCompatDiff = computeRuleDiff(resolved.base, resolved.jsCompat)
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
    ...testsDiff,
    ...e2eDiff,
    ...storiesDiff,
  }
  const requiredNamespaces = collectNamespaces(allRules)

  // Determine which features are active based on options
  const hasReact = opts.react === true
  const hasNode = opts.node === true
  const hasOxlint = opts.oxlint === true

  // Build the import block
  const imports = buildImports(requiredNamespaces, { hasReact, hasNode, hasOxlint })

  // Build the config blocks
  const blocks: string[] = [ "  // TypeScript parser setup", "  ...tseslint.configs.strictTypeChecked.slice(0, 2),", ""]

  // 1. TypeScript parser setup (structural blocks)

  // 2. Main base block — all effective rules for *.ts
  blocks.push(emitBaseBlock(baseRules, baseNamespaces, { hasReact, hasNode }))

  // 3. JS Compat — disable type-checked rules for .js files
  if (Object.keys(jsCompatDiff).length > 0) {
    blocks.push(emitOverrideBlock(
      "eslint-config-setup/js-compat",
      ["**/*.{js,mjs,cjs}"],
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
  blocks.push(emitMarkdownBlock())

  // 14. OxLint (absolute last)
  if (hasOxlint) {
    blocks.push(emitOxlintBlock(opts))
  }

  // Assemble the module
  const lines = [
    "// Auto-generated by eslint-config-setup — do not edit",
    "// @ts-nocheck",
    ...imports,
    "",
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
  const result = {} as Record<keyof typeof FILE_PROBES, Rules>

  for (const [key, filename] of Object.entries(FILE_PROBES)) {
    result[key as keyof typeof FILE_PROBES] = resolveRulesForFile(config, filename)
  }

  return result
}

/**
 * Merges rules from all config objects that match a given filename.
 * Skips configs with `language` (JSON, JSONC) or `processor` (markdown)
 * since those use different parsers.
 */
function resolveRulesForFile(config: FlatConfigArray, filename: string): Rules {
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
  // biome-ignore lint: using `any` for dynamic property access
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
// Rule diffing
// ────────────────────────────────────────────────────────────────────────────

/**
 * Filters out rules set to "off" — they're redundant in the base block
 * since ESLint defaults to "off" for unconfigured rules.
 */
function filterOffRules(rules: Rules): Rules {
  const filtered: Rules = {}
  for (const [rule, value] of Object.entries(rules)) {
    const severity = Array.isArray(value) ? value[0] : value
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
    const slashIndex = ruleName.indexOf("/")
    if (slashIndex !== -1) {
      // Check for second slash (e.g. @typescript-eslint/no-unused-vars)
      return ruleName.slice(0, slashIndex)
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
  features: { hasReact: boolean; hasNode: boolean },
): string {
  const lines: string[] = [ "  // Base rules — all effective rules for *.ts files", "  {", '    name: "eslint-config-setup/base",', "    plugins: {"]

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

  // Settings
  if (features.hasReact) {
    lines.push("    settings: {", '      react: { version: "detect" },', "    },")
  }

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

function emitMarkdownBlock(): string {
  return [
    "  // Markdown/MDX parsing",
    "  {",
    "    ...mdxPlugin.flat,",
    "    processor: mdxPlugin.createRemarkProcessor({ lintCodeBlocks: true, languageMapper: {} }),",
    "  },",
    "  // Markdown/MDX code block linting",
    "  {",
    "    ...mdxPlugin.flatCodeBlocks,",
    "    rules: {",
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

function emitOxlintBlock(opts: ConfigOptions): string {
  const lines: string[] = [ "  // OxLint integration — disables rules already covered by OxLint"]

  // Helper to emit a spread config
  const addSpread = (configName: string, blockName: string): void => {
    lines.push(`  { name: "eslint-config-setup/${blockName}", ...oxlintPlugin.configs[${JSON.stringify(configName)}] },`)
  }

  addSpread("flat/recommended", "oxlint")
  if (opts.react) {
    addSpread("flat/react", "oxlint-react")
    addSpread("flat/jsx-a11y", "oxlint-jsx-a11y")
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
    if (ns !== null && !baseNamespaces.has(ns)) {
      if (ns in pluginRegistry) {
        plugins.set(ns, pluginRegistry[ns].pluginExpr)
      }
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
function sortRules(rules: Rules): Rules {
  const sorted: Rules = {}
  for (const key of Object.keys(rules).sort()) {
    sorted[key] = rules[key]
  }
  return sorted
}
