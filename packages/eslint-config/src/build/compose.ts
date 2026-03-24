/* eslint-disable max-statements -- Composition function: sequentially pushes all config blocks. Each push is trivial but there are many configs. */
import type { ConfigOptions, FlatConfigArray } from "../types"

import { aiConfig } from "../configs/ai"
import { baseConfig } from "../configs/base"
import { compatConfig } from "../configs/compat"
import { cspellConfig } from "../configs/cspell"
import { deMorganConfig } from "../configs/de-morgan"
import { importsConfig } from "../configs/imports"
import { jsdocConfig } from "../configs/jsdoc"
import { jsonConfig } from "../configs/json"
import { markdownConfig } from "../configs/markdown"
import { nodeConfig } from "../configs/node"
import { packageJsonAiConfig, packageJsonConfig } from "../configs/package-json"
import { perfectionistAiConfig, perfectionistConfig } from "../configs/perfectionist"
import { prettierCompatConfig } from "../configs/prettier"
import { reactConfig } from "../configs/react"
import { reactEffectConfig } from "../configs/react-effect"
import { regexpConfig } from "../configs/regexp"
import { securityConfig } from "../configs/security"
import { sonarjsConfig } from "../configs/sonarjs"
import { typescriptConfig } from "../configs/typescript"
import { unicornConfig } from "../configs/unicorn"
import { configFilesOverride } from "../overrides/config-files"
import { declarationsOverride } from "../overrides/declarations"
import { e2eOverride } from "../overrides/e2e"
import { scriptsOverride } from "../overrides/scripts"
import { storiesOverride } from "../overrides/stories"
import { testsOverride } from "../overrides/tests"
import { oxlintIntegration } from "../oxlint/integration"
import { standardComplexity } from "../presets/standard"

/**
 * Composes a full flat config array from the given options.
 * This is the core logic used by the build system to generate configs.
 */
export function composeConfig(opts: ConfigOptions): FlatConfigArray {
  const config: FlatConfigArray = []

  const ai = opts.ai

  // 1. Base rules (always — AI flag tightens complexity + adds structural rules)
  config.push(...baseConfig({ ai }))

  // 2. TypeScript (always — AI flag adds naming, magic-numbers, etc.)
  config.push(...typescriptConfig({ ai, react: opts.react }))

  // 3. Imports (always)
  config.push(...importsConfig())

  // 4. Perfectionist — mechanical sorting (always)
  config.push(...perfectionistConfig())

  // 5. Unicorn (always — AI flag adds stricter patterns)
  config.push(...unicornConfig({ ai }))

  // 5. Regexp (always — AI flag adds self-documenting patterns)
  config.push(...regexpConfig({ ai }))

  // 6. JSDoc (always — AI flag requires param/returns docs)
  config.push(...jsdocConfig({ ai }))

  // 7. CSpell (always)
  config.push(...cspellConfig())

  // 8. SonarJS (always — AI flag adds quality rules)
  config.push(...sonarjsConfig({ ai }))

  // 9. Security (always)
  config.push(...securityConfig())

  // 10. De Morgan (always)
  config.push(...deMorganConfig())

  // 11. Browser compat (when not a Node.js project)
  if (!opts.node) {
    config.push(...compatConfig())
  }

  // 11. Complexity preset (before AI which may override)
  if (!ai) {
    config.push(...standardComplexity())
  }

  // 12. Node.js (conditional — AI flag adds builtins check)
  if (opts.node) {
    config.push(...nodeConfig({ ai }))
  }

  // 13. React (conditional — AI flag promotes warn→error)
  if (opts.react) {
    config.push(...reactConfig({ ai }))
    config.push(...reactEffectConfig())
  }

  // 14. AI mode — file-scoped relaxations + cross-cutting AI concerns
  if (ai) {
    config.push(...aiConfig())
    config.push(...perfectionistAiConfig())
    config.push(...packageJsonAiConfig())
  }

  // 15. File-pattern overrides (always relevant — no-op if files don't exist)
  config.push(...testsOverride())
  config.push(...e2eOverride())
  config.push(...storiesOverride())
  config.push(...configFilesOverride())
  config.push(...declarationsOverride())
  config.push(...scriptsOverride())

  // 16. JSON, Package.json & Markdown (always)
  config.push(...jsonConfig())
  config.push(...packageJsonConfig())
  config.push(...markdownConfig())

  // 18. Prettier compat (always last for TS/JS rules)
  config.push(...prettierCompatConfig())

  // 19. OxLint (absolute last — disables rules OxLint already covers)
  if (opts.oxlint) {
    config.push(...oxlintIntegration(opts))
  }

  return config
}
