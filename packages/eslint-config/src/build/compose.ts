import { aiConfig } from "../configs/ai"
import { baseConfig } from "../configs/base"
import { cspellConfig } from "../configs/cspell"
import { importsConfig } from "../configs/imports"
import { jsdocConfig } from "../configs/jsdoc"
import { jsonConfig } from "../configs/json"
import { markdownConfig } from "../configs/markdown"
import { nodeConfig } from "../configs/node"
import { prettierCompatConfig } from "../configs/prettier"
import { reactConfig } from "../configs/react"
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

  // 4. Unicorn (always)
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

  // 10. Complexity preset (before AI which may override)
  if (!opts.ai) {
    config.push(...standardComplexity())
  }

  // 11. Node.js (conditional)
  if (opts.node) {
    config.push(...nodeConfig())
  }

  // 12. React (conditional)
  if (opts.react) {
    config.push(...reactConfig())
  }

  // 13. AI mode (conditional — includes its own complexity limits)
  if (opts.ai) {
    config.push(...aiConfig())
  }

  // 14. File-pattern overrides (always relevant)
  config.push(...testsOverride(opts))
  config.push(...e2eOverride())
  config.push(...configFilesOverride())
  config.push(...declarationsOverride())
  config.push(...scriptsOverride())

  // 15. Stories (only with React)
  if (opts.react) {
    config.push(...storiesOverride())
  }

  // 16. JSON & Markdown (always)
  config.push(...jsonConfig())
  config.push(...markdownConfig())

  // 17. Prettier compat (always last for TS/JS rules)
  config.push(...prettierCompatConfig())

  // 18. OxLint (absolute last — disables rules OxLint already covers)
  if (opts.oxlint) {
    config.push(...oxlintIntegration(opts))
  }

  return config
}
