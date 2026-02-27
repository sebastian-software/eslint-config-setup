import { aiConfig } from "../configs/ai.ts"
import { baseConfig } from "../configs/base.ts"
import { cspellConfig } from "../configs/cspell.ts"
import { importsConfig } from "../configs/imports.ts"
import { jsdocConfig } from "../configs/jsdoc.ts"
import { jsonConfig } from "../configs/json.ts"
import { markdownConfig } from "../configs/markdown.ts"
import { nodeConfig } from "../configs/node.ts"
import { prettierCompatConfig } from "../configs/prettier.ts"
import { reactConfig } from "../configs/react.ts"
import { regexpConfig } from "../configs/regexp.ts"
import { securityConfig } from "../configs/security.ts"
import { sonarjsConfig } from "../configs/sonarjs.ts"
import { typescriptConfig } from "../configs/typescript.ts"
import { unicornConfig } from "../configs/unicorn.ts"
import { configFilesOverride } from "../overrides/config-files.ts"
import { declarationsOverride } from "../overrides/declarations.ts"
import { e2eOverride } from "../overrides/e2e.ts"
import { scriptsOverride } from "../overrides/scripts.ts"
import { storiesOverride } from "../overrides/stories.ts"
import { testsOverride } from "../overrides/tests.ts"
import { standardComplexity } from "../presets/standard.ts"
import { oxlintIntegration } from "../oxlint/integration.ts"
import type { ConfigOptions, FlatConfigArray } from "../types.ts"

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
