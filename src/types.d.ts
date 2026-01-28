declare module "eslint-config-prettier" {
  import { Linter } from "eslint"
  const config: {
    rules: Linter.Rules
  }
  export = config
}

declare module "eslint-plugin-react-hooks" {
  import type { ESLint, Linter } from "eslint"
  const plugin: ESLint.Plugin & {
    configs: {
      recommended: { plugins: string[]; rules: Linter.RulesRecord }
      "recommended-latest": { plugins: string[]; rules: Linter.RulesRecord }
    }
  }
  export = plugin
}

declare module "eslint-plugin-react-compiler" {
  import type { ESLint, Linter } from "eslint"
  const plugin: ESLint.Plugin & {
    configs: {
      recommended: {
        plugins: Record<string, ESLint.Plugin>
        rules: Linter.RulesRecord
      }
    }
  }
  export = plugin
}

declare module "eslint-plugin-check-file" {
  import { Linter } from "eslint"
  export const rules: Linter.Rules
}

declare module "eslint-plugin-jsx-a11y" {
  import type { ConfigWithExtends } from "typescript-eslint"

  export const rules: Linter.Rules
  export const flatConfigs: Record<string, ConfigWithExtends>
}

declare module "eslint-plugin-sonarjs" {
  import type { ESLint } from "eslint"
  const plugin: ESLint.Plugin
  export default plugin
}
