/**
 * Modular exports for power users who want to compose configs manually.
 *
 * Usage:
 * ```ts
 * import { configs, overrides } from "eslint-config-setup/modules"
 *
 * export default [
 *   ...configs.base(),
 *   ...configs.typescript(),
 *   ...configs.imports(),
 *   ...configs.unicorn(),
 *   ...overrides.tests({ react: true }),
 *   ...configs.prettier(),
 * ]
 * ```
 */

export { aiConfig as ai } from "./configs/ai"
// Config building blocks
export { baseConfig as base } from "./configs/base"
export { cspellConfig as cspell } from "./configs/cspell"
export { deMorganConfig as deMorgan } from "./configs/de-morgan"
export { importsConfig as imports } from "./configs/imports"
export { jsdocConfig as jsdoc } from "./configs/jsdoc"
export { jsonConfig as json } from "./configs/json"
export { markdownConfig as markdown } from "./configs/markdown"
export { nodeConfig as node } from "./configs/node"
export { packageJsonConfig as packageJson, packageJsonAiConfig as packageJsonAi } from "./configs/package-json"
export { perfectionistConfig as perfectionist, perfectionistAiConfig as perfectionistAi } from "./configs/perfectionist"
export { prettierCompatConfig as prettier } from "./configs/prettier"
export { reactConfig as react } from "./configs/react"
export { reactEffectConfig as reactEffect } from "./configs/react-effect"
export { regexpConfig as regexp } from "./configs/regexp"
export { securityConfig as security } from "./configs/security"
export { sonarjsConfig as sonarjs } from "./configs/sonarjs"
export { typescriptConfig as typescript } from "./configs/typescript"
export { unicornConfig as unicorn } from "./configs/unicorn"

export { configFilesOverride as configFiles } from "./overrides/config-files"
export { declarationsOverride as declarations } from "./overrides/declarations"
export { e2eOverride as e2e } from "./overrides/e2e"
export { scriptsOverride as scripts } from "./overrides/scripts"
export { storiesOverride as stories } from "./overrides/stories"
// File-pattern overrides
export { testsOverride as tests } from "./overrides/tests"

// Complexity preset
export { standardComplexity } from "./presets/standard"

// OxLint integration
export { oxlintIntegration as oxlint } from "./oxlint/integration"

// Compose utility (same as used in build)
export { composeConfig } from "./build/compose"
