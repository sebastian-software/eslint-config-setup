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
import { standardComplexity } from "../presets/standard"
import { oxlintIntegration } from "../oxlint/integration"
import type { ConfigOptions, FlatConfigArray } from "../types"

/**
 * Composes a full flat config array from the given options.
 * This is the core logic used by the build system to generate configs.
 */
export function composeConfig(opts: ConfigOptions): FlatConfigArray {
  const config: FlatConfigArray = []

  // 1. Base rules (always)
  config.push(...baseConfig())

  // 2. TypeScript (always, uses strictTypeChecked)
  config.push(...typescriptConfig())

  // 3. Imports (always)
  config.push(...importsConfig())

  // 4. Perfectionist — mechanical sorting (always)
  config.push(...perfectionistConfig())

  // 5. Unicorn (always)
  config.push(...unicornConfig())

  // 5. Regexp (always)
  config.push(...regexpConfig())

  // 6. JSDoc (always)
  config.push(...jsdocConfig())

  // 7. CSpell (always)
  config.push(...cspellConfig())

  // 8. SonarJS (always)
  config.push(...sonarjsConfig())

  // 9. Security (always)
  config.push(...securityConfig())

  // 10. De Morgan (always)
  config.push(...deMorganConfig())

  // 11. Browser compat (when not a Node.js project)
  if (!opts.node) {
    config.push(...compatConfig())
  }

  // 11. Complexity preset (before AI which may override)
  if (!opts.ai) {
    config.push(...standardComplexity())
  }

  // 12. Node.js (conditional)
  if (opts.node) {
    config.push(...nodeConfig())
  }

  // 13. React (conditional)
  if (opts.react) {
    config.push(...reactConfig())
    config.push(...reactEffectConfig())
  }

  // 14. AI mode (conditional — includes its own complexity limits)
  if (opts.ai) {
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
