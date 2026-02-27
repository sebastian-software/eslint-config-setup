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
export { baseConfig as base } from "./configs/base.ts"
export { typescriptConfig as typescript } from "./configs/typescript.ts"
export { importsConfig as imports } from "./configs/imports.ts"
export { unicornConfig as unicorn } from "./configs/unicorn.ts"
export { regexpConfig as regexp } from "./configs/regexp.ts"
export { jsdocConfig as jsdoc } from "./configs/jsdoc.ts"
export { cspellConfig as cspell } from "./configs/cspell.ts"
export { sonarjsConfig as sonarjs } from "./configs/sonarjs.ts"
export { securityConfig as security } from "./configs/security.ts"
export { nodeConfig as node } from "./configs/node.ts"
export { reactConfig as react } from "./configs/react.ts"
export { jsonConfig as json } from "./configs/json.ts"
export { markdownConfig as markdown } from "./configs/markdown.ts"
export { prettierCompatConfig as prettier } from "./configs/prettier.ts"
export { aiConfig as ai } from "./configs/ai.ts"

// File-pattern overrides
export { testsOverride as tests } from "./overrides/tests.ts"
export { e2eOverride as e2e } from "./overrides/e2e.ts"
export { storiesOverride as stories } from "./overrides/stories.ts"
export { configFilesOverride as configFiles } from "./overrides/config-files.ts"
export { declarationsOverride as declarations } from "./overrides/declarations.ts"
export { scriptsOverride as scripts } from "./overrides/scripts.ts"

// Complexity preset
export { standardComplexity } from "./presets/standard.ts"

// OxLint integration
export { oxlintIntegration as oxlint } from "./oxlint/integration.ts"

// Compose utility (same as used in build)
export { composeConfig } from "./build/compose.ts"
