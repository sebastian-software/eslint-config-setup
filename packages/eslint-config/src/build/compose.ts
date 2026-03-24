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
function addCoreConfigs(config: FlatConfigArray, opts: ConfigOptions): void {
  const ai = opts.ai

  config.push(
    ...baseConfig({ ai }),
    ...typescriptConfig({ ai, react: opts.react }),
    ...importsConfig(),
    ...perfectionistConfig(),
    ...unicornConfig({ ai }),
    ...regexpConfig({ ai }),
    ...jsdocConfig({ ai }),
    ...cspellConfig(),
    ...sonarjsConfig({ ai }),
    ...securityConfig(),
    ...deMorganConfig(),
  )
}

function addConditionalConfigs(config: FlatConfigArray, opts: ConfigOptions): void {
  if (!opts.node) {
    config.push(...compatConfig())
  }

  if (!opts.ai) {
    config.push(...standardComplexity())
  }

  if (opts.node) {
    config.push(...nodeConfig({ ai: opts.ai }))
  }

  if (opts.react) {
    config.push(...reactConfig({ ai: opts.ai }))
    config.push(...reactEffectConfig())
  }

  if (opts.ai) {
    config.push(...aiConfig())
    config.push(...perfectionistAiConfig())
    config.push(...packageJsonAiConfig())
  }
}

function addFileTypeOverrides(config: FlatConfigArray): void {
  config.push(
    ...testsOverride(),
    ...e2eOverride(),
    ...storiesOverride(),
    ...configFilesOverride(),
    ...declarationsOverride(),
    ...scriptsOverride(),
  )
}

function addFinalConfigs(config: FlatConfigArray, opts: ConfigOptions): void {
  config.push(...jsonConfig(), ...packageJsonConfig(), ...markdownConfig(), ...prettierCompatConfig())

  if (opts.oxlint) {
    config.push(...oxlintIntegration(opts))
  }
}

export function composeConfig(opts: ConfigOptions): FlatConfigArray {
  const config: FlatConfigArray = []

  addCoreConfigs(config, opts)
  addConditionalConfigs(config, opts)
  addFileTypeOverrides(config)
  addFinalConfigs(config, opts)

  return config
}
