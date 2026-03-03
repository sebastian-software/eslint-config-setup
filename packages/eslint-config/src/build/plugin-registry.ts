/**
 * Plugin registry — maps rule namespaces to their NPM packages, import
 * statements, and the expression used in `plugins: { ... }` blocks.
 *
 * Used by the code generator to produce valid JS modules with real imports
 * instead of serialized plugin objects.
 */

export interface PluginEntry {
  /** npm package name */
  pkg: string
  /** Variable name after import */
  varName: string
  /** Import statement (full line) */
  importStatement: string
  /** Expression for `plugins: { namespace: <expr> }` */
  pluginExpr: string
}

/**
 * Every plugin used across all configs and overrides, keyed by their
 * rule-namespace (the prefix before `/` in rule names).
 *
 * Special entries (configs/presets that aren't used via `plugins: {}`) are
 * handled separately in the code-gen template blocks.
 */
export const pluginRegistry: Record<string, PluginEntry> = {
  "@typescript-eslint": {
    pkg: "typescript-eslint",
    varName: "tseslint",
    importStatement: 'import tseslint from "typescript-eslint"',
    pluginExpr: "tseslint.plugin",
  },
  "import": {
    pkg: "eslint-plugin-import-x",
    varName: "importXPlugin",
    importStatement: 'import importXPlugin from "eslint-plugin-import-x"',
    pluginExpr: "importXPlugin",
  },
  "unused-imports": {
    pkg: "eslint-plugin-unused-imports",
    varName: "unusedImportsPlugin",
    importStatement: 'import unusedImportsPlugin from "eslint-plugin-unused-imports"',
    pluginExpr: "unusedImportsPlugin",
  },
  unicorn: {
    pkg: "eslint-plugin-unicorn",
    varName: "unicornPlugin",
    importStatement: 'import unicornPlugin from "eslint-plugin-unicorn"',
    pluginExpr: "unicornPlugin",
  },
  sonarjs: {
    pkg: "eslint-plugin-sonarjs",
    varName: "sonarjsPlugin",
    importStatement: 'import sonarjsPlugin from "eslint-plugin-sonarjs"',
    pluginExpr: "sonarjsPlugin",
  },
  regexp: {
    pkg: "eslint-plugin-regexp",
    varName: "regexpPlugin",
    importStatement: 'import regexpPlugin from "eslint-plugin-regexp"',
    pluginExpr: "regexpPlugin",
  },
  jsdoc: {
    pkg: "eslint-plugin-jsdoc",
    varName: "jsdocPlugin",
    importStatement: 'import jsdocPlugin from "eslint-plugin-jsdoc"',
    pluginExpr: "jsdocPlugin",
  },
  perfectionist: {
    pkg: "eslint-plugin-perfectionist",
    varName: "perfectionistPlugin",
    importStatement: 'import perfectionistPlugin from "eslint-plugin-perfectionist"',
    pluginExpr: "perfectionistPlugin",
  },
  "@cspell": {
    pkg: "@cspell/eslint-plugin",
    varName: "cspellPlugin",
    importStatement: 'import cspellPlugin from "@cspell/eslint-plugin"',
    pluginExpr: "cspellPlugin",
  },
  security: {
    pkg: "eslint-plugin-security",
    varName: "securityPlugin",
    importStatement: 'import securityPlugin from "eslint-plugin-security"',
    pluginExpr: "securityPlugin",
  },
  "de-morgan": {
    pkg: "eslint-plugin-de-morgan",
    varName: "deMorganPlugin",
    importStatement: 'import deMorganPlugin from "eslint-plugin-de-morgan"',
    pluginExpr: "deMorganPlugin",
  },
  compat: {
    pkg: "eslint-plugin-compat",
    varName: "compatPlugin",
    importStatement: 'import compatPlugin from "eslint-plugin-compat"',
    pluginExpr: "compatPlugin",
  },
  node: {
    pkg: "eslint-plugin-n",
    varName: "nodePlugin",
    importStatement: 'import nodePlugin from "eslint-plugin-n"',
    pluginExpr: "nodePlugin",
  },
  react: {
    pkg: "eslint-plugin-react",
    varName: "reactPlugin",
    importStatement: 'import reactPlugin from "eslint-plugin-react"',
    pluginExpr: "reactPlugin",
  },
  "react-hooks": {
    pkg: "eslint-plugin-react-hooks",
    varName: "reactHooksPlugin",
    importStatement: 'import reactHooksPlugin from "eslint-plugin-react-hooks"',
    pluginExpr: "reactHooksPlugin",
  },
  "react-refresh": {
    pkg: "eslint-plugin-react-refresh",
    varName: "reactRefreshPlugin",
    importStatement: 'import reactRefreshPlugin from "eslint-plugin-react-refresh"',
    pluginExpr: "reactRefreshPlugin",
  },
  "jsx-a11y": {
    pkg: "eslint-plugin-jsx-a11y",
    varName: "jsxA11yPlugin",
    importStatement: 'import jsxA11yPlugin from "eslint-plugin-jsx-a11y"',
    pluginExpr: "jsxA11yPlugin",
  },
  "react-you-might-not-need-an-effect": {
    pkg: "eslint-plugin-react-you-might-not-need-an-effect",
    varName: "reactEffectPlugin",
    importStatement: 'import reactEffectPlugin from "eslint-plugin-react-you-might-not-need-an-effect"',
    pluginExpr: "reactEffectPlugin",
  },
  vitest: {
    pkg: "@vitest/eslint-plugin",
    varName: "vitestPlugin",
    importStatement: 'import vitestPlugin from "@vitest/eslint-plugin"',
    pluginExpr: "vitestPlugin",
  },
  "testing-library": {
    pkg: "eslint-plugin-testing-library",
    varName: "testingLibraryPlugin",
    importStatement: 'import testingLibraryPlugin from "eslint-plugin-testing-library"',
    pluginExpr: "testingLibraryPlugin",
  },
  playwright: {
    pkg: "eslint-plugin-playwright",
    varName: "playwrightPlugin",
    importStatement: 'import playwrightPlugin from "eslint-plugin-playwright"',
    pluginExpr: "playwrightPlugin",
  },
  storybook: {
    pkg: "eslint-plugin-storybook",
    varName: "storybookPlugin",
    importStatement: 'import storybookPlugin from "eslint-plugin-storybook"',
    pluginExpr: "storybookPlugin",
  },
  json: {
    pkg: "@eslint/json",
    varName: "jsonPlugin",
    importStatement: 'import jsonPlugin from "@eslint/json"',
    pluginExpr: "jsonPlugin",
  },
}

/**
 * Standalone imports that aren't keyed by rule-namespace but are needed
 * in generated config modules (presets, configs, processors).
 */
export const standaloneImports = {
  tseslint: 'import tseslint from "typescript-eslint"',
  mdxPlugin: 'import * as mdxPlugin from "eslint-plugin-mdx"',
  packageJsonPlugin: 'import packageJsonPlugin from "eslint-plugin-package-json"',
  globals: 'import globals from "globals"',
  oxlintPlugin: 'import oxlintPlugin from "eslint-plugin-oxlint"',
} as const
