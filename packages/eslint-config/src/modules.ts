/**
 * Modular exports for power users who want to compose configs manually.
 *
 * Usage:
 * ```ts
 * import { configs, overrides } from "@effective/eslint-config/modules"
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

// Config building blocks
export { baseConfig as base } from "./configs/base"
export { typescriptConfig as typescript } from "./configs/typescript"
export { importsConfig as imports } from "./configs/imports"
export { unicornConfig as unicorn } from "./configs/unicorn"
export { regexpConfig as regexp } from "./configs/regexp"
export { jsdocConfig as jsdoc } from "./configs/jsdoc"
export { cspellConfig as cspell } from "./configs/cspell"
export { sonarjsConfig as sonarjs } from "./configs/sonarjs"
export { securityConfig as security } from "./configs/security"
export { nodeConfig as node } from "./configs/node"
export { reactConfig as react } from "./configs/react"
export { jsonConfig as json } from "./configs/json"
export { markdownConfig as markdown } from "./configs/markdown"
export { prettierCompatConfig as prettier } from "./configs/prettier"
export { aiConfig as ai } from "./configs/ai"

// File-pattern overrides
export { testsOverride as tests } from "./overrides/tests"
export { e2eOverride as e2e } from "./overrides/e2e"
export { storiesOverride as stories } from "./overrides/stories"
export { configFilesOverride as configFiles } from "./overrides/config-files"
export { declarationsOverride as declarations } from "./overrides/declarations"
export { scriptsOverride as scripts } from "./overrides/scripts"

// Complexity preset
export { standardComplexity } from "./presets/standard"

// OxLint integration
export { oxlintIntegration as oxlint } from "./oxlint/integration"

// Compose utility (same as used in build)
export { composeConfig } from "./build/compose"
