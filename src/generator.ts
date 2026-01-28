import eslint from "@eslint/js"
import { ESLint, Linter } from "eslint"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintJsdoc from "eslint-plugin-jsdoc"
import eslintJsxA11y from "eslint-plugin-jsx-a11y"
import nodePlugin from "eslint-plugin-n"
import eslintReact from "eslint-plugin-react"
import eslintReactCompiler from "eslint-plugin-react-compiler"
import eslintReactHooks from "eslint-plugin-react-hooks"
import eslintRegexp from "eslint-plugin-regexp"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import eslintSonarjs from "eslint-plugin-sonarjs"
import eslintTestingLib from "eslint-plugin-testing-library"
import eslintPlaywright from "eslint-plugin-playwright"
import eslintVitest from "@vitest/eslint-plugin"
import eslintStorybook from "eslint-plugin-storybook"
import { format } from "prettier"
import tseslint from "typescript-eslint"

interface RuleOptions {
  /** enable NodeJS checks */
  node?: boolean

  /* enable React related rules */
  react?: boolean

  /* enable strict checks - recommended */
  strict?: boolean

  /** enable strict maintainability rules for AI-generated code */
  ai?: boolean
}

export type FlatConfig = ReturnType<typeof tseslint.config>
export type ExtendsList = Parameters<typeof tseslint.config>
export type ConfigParam = ESLint.Options["overrideConfig"]

const reactFlat = eslintReact.configs.flat

interface Settings {
  fileName?: string
}

export async function buildConfig(
  options: RuleOptions,
  { fileName }: Settings = {}
): Promise<ConfigWithModuleRefs> {
  const { node, react, strict, ai } = options

  const presets: ExtendsList = [eslint.configs.recommended]

  presets.push(
    strict
      ? // Contains all of recommended, recommended-type-checked, and strict,
        // along with additional strict rules that require type information.
        tseslint.configs.strictTypeChecked
      : // Contains all of recommended along with additional recommended rules
        // that require type information. Rules newly added in this configuration
        // are similarly useful to those in recommended.
        tseslint.configs.recommendedTypeChecked
  )

  if (react) {
    // React core recommended rules
    presets.push(reactFlat.recommended)
    presets.push({ rules: reactFlat["jsx-runtime"].rules })

    // React Hooks - use preset rules but register plugin manually (preset is eslintrc format)
    const hooksPresetRules = eslintReactHooks.configs["recommended-latest"].rules
    presets.push({
      plugins: { "react-hooks": eslintReactHooks },
      rules: {
        ...hooksPresetRules,
        // Preset has this as "warn", we want "error"
        "react-hooks/exhaustive-deps": "error"
      }
    })

    // React Compiler
    presets.push(eslintReactCompiler.configs.recommended)

    // Storybook
    presets.push(...eslintStorybook.configs["flat/recommended"])

    // A11y - always enable, not responsible when not doing so
    presets.push(eslintJsxA11y.flatConfigs.recommended)
  }

  // JSDoc: Full TypeScript-aware preset
  presets.push(eslintJsdoc.configs["flat/recommended-typescript-error"])

  // JSDoc: Rules that are simply wrong or too noisy
  presets.push({
    rules: {
      // Too many false positives where the description was actually fine
      "jsdoc/informative-docs": "off",
      // We're fine with raw HTML and Array<string> syntax in JSDoc
      "jsdoc/text-escaping": "off",
      // Breaks often where human-written content was better
      "jsdoc/check-line-alignment": "off",
      // Unwanted side-effects, better use a generic line-before-comments rule
      "jsdoc/lines-before-block": "off"
    }
  })

  // JSDoc: Style tweaks
  presets.push({
    rules: {
      // Don't check destructured props - types handle this better
      "jsdoc/check-param-names": ["error", { checkDestructured: false }],
      // Consistent tag formatting
      "jsdoc/tag-lines": ["error", "never", { startLines: 1 }],
      // TSDoc compatibility: hyphen before param description
      "jsdoc/require-hyphen-before-param-description": ["error", "always"],
      // Uniform asterisk formatting
      "jsdoc/require-asterisk-prefix": "error"
    }
  })

  // JSDoc: Disable require-* rules unless ai mode is enabled
  if (!ai) {
    presets.push({
      rules: {
        // Don't enforce JSDoc presence globally - only when ai mode is on
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param": "off",
        "jsdoc/require-param-description": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/require-returns-description": "off",
        "jsdoc/require-property": "off",
        "jsdoc/require-property-description": "off"
      }
    })
  }

  // TypeScript & React tweaks
  presets.push({
    rules: {
      // Disable prop-type checks - strict TypeScript handles this better
      // Also has a long-standing bug with React.memo:
      // https://github.com/jsx-eslint/eslint-plugin-react/issues/2760
      "react/prop-types": "off",

      // Match TSC behavior for unused vars (preset differs from TSC defaults)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],

      // Use array-simple style (XO/Sindre preference) - complex arrays stay as Array<>
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }]
    }
  })

  // Check some validity related to usage and definition of regular expressions
  presets.push(eslintRegexp.configs["flat/recommended"])

  // Add Vitest/TestingLibrary/Playwright recommended configuration
  const testFiles = react ? "**/*.test.{ts,tsx}" : "**/*.test.ts"
  const specFiles = "**/*.spec.ts"

  const testingLibRules =
    eslintTestingLib.configs[react ? "flat/react" : "flat/dom"]

  presets.push({
    ...eslintVitest.configs.recommended,
    files: [testFiles]
  })

  // Keep in a separate preset push to prevent overwriting keys from Vitest.
  presets.push({
    ...testingLibRules,
    files: [testFiles]
  })

  presets.push({
    ...eslintPlaywright.configs["flat/recommended"],
    files: [specFiles]
  })

  // Relax size limits for test files - tests are often long
  presets.push({
    files: [testFiles, specFiles],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off"
    }
  })

  // Config files (vite.config.ts, vitest.config.ts, etc.) - be lenient
  const configFiles = "**/*.config.{ts,mts,cts}"
  presets.push({
    files: [configFiles],
    rules: {
      // Config files often need require() for CJS plugins
      "@typescript-eslint/no-require-imports": "off",
      // Default exports are standard in config files
      "import/no-default-export": "off",
      // Config files can be complex
      "max-lines": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      // Console in build scripts is fine
      "no-console": "off"
    }
  })

  // Type definition files (*.d.ts) - declarations only
  const dtsFiles = "**/*.d.ts"
  presets.push({
    files: [dtsFiles],
    rules: {
      // Declarations don't use the types they declare
      "@typescript-eslint/no-unused-vars": "off",
      // Empty interfaces are common for declaration merging
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // Triple-slash references are standard in d.ts
      "@typescript-eslint/triple-slash-reference": "off"
    }
  })

  // Check NodeJS things (ESM mode)
  if (node) {
    presets.push(nodePlugin.configs["flat/recommended-module"])

    const tryExtensions = [".js", ".ts"]
    if (react) {
      tryExtensions.push(".tsx")
    }

    presets.push({
      settings: { n: { tryExtensions } }
    })
  }

  // Configure TS parser
  presets.push({
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: react
        },
        projectService: true
      }
    }
  })

  // Always disable rules which are better enforced by Prettier
  presets.push(eslintConfigPrettier)

  if (ai) {
    // Stylistic rules for clean, consistent code
    presets.push(tseslint.configs.stylisticTypeChecked)
    presets.push({
      plugins: { "simple-import-sort": simpleImportSort },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error"
      }
    })

    // Complexity & maintainability rules
    presets.push({
      plugins: { sonarjs: eslintSonarjs },
      rules: {
        // Complexity Limits
        complexity: ["error", { max: 10 }],
        "max-depth": ["error", { max: 3 }],
        "max-nested-callbacks": ["error", { max: 2 }],
        "max-params": ["error", { max: 4 }],

        // Size Limits
        "max-lines": [
          "error",
          { max: 300, skipBlankLines: true, skipComments: true }
        ],
        "max-lines-per-function": [
          "error",
          { max: 50, skipBlankLines: true, skipComments: true }
        ],
        "max-statements": ["error", { max: 15 }],
        "max-statements-per-line": ["error", { max: 1 }],

        // SonarJS Rules
        "sonarjs/cognitive-complexity": ["error", 10],
        "sonarjs/no-duplicate-string": ["error", { threshold: 3 }],
        "sonarjs/no-identical-functions": "error",
        "sonarjs/no-collapsible-if": "error",
        "sonarjs/no-collection-size-mischeck": "error",
        "sonarjs/no-redundant-boolean": "error",
        "sonarjs/no-unused-collection": "error",
        "sonarjs/prefer-immediate-return": "error",
        "sonarjs/prefer-single-boolean-return": "error",

        // Additional Strict Rules
        "no-nested-ternary": "error",
        "no-unneeded-ternary": "error",
        "prefer-template": "error",
        "object-shorthand": ["error", "always"],
        "prefer-arrow-callback": "error",
        "no-param-reassign": "error"
      }
    })
  }

  const config = tseslint.config(presets)

  const linter = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as ConfigParam
  })

  const generatedConfig = (await linter.calculateConfigForFile(
    fileName ?? "index.ts"
  )) as Linter.Config

  cleanupRules(generatedConfig)

  // Tweak some defaults which are injected but somehow not configurable via API.
  if (generatedConfig.linterOptions) {
    generatedConfig.linterOptions.reportUnusedDisableDirectives = "off"
    generatedConfig.linterOptions.reportUnusedInlineConfigs = "off"
  }

  // This is more useful as a command line argument than a built-in option.
  const { parser, ...languageOptionsWithoutParser } =
    generatedConfig.languageOptions ?? {}

  const configWithModuleRefs = {
    ...generatedConfig,
    languageOptions: {
      ...generatedConfig.languageOptions,
      parser: "[[[@typescript-eslint/parser]]]"
    },
    plugins: cleanupPlugins(generatedConfig.plugins)
  }

  // This is newly generated in ESLint v9.7 and holds language information
  // which is not needed for the generated config.
  delete configWithModuleRefs.language

  return configWithModuleRefs
}

export type ConfigWithModuleRefs = Omit<
  Linter.Config<Linter.RulesRecord>,
  "plugins" | "languageOptions"
> & {
  plugins?: Record<string, string>
  languageOptions?: {
    parser?: string
  } & Omit<Linter.LanguageOptions, "parser">
}

export function configToModule(config: unknown) {
  const exportedConfig = JSON.stringify(config, null, 2)
  const moduleConfig = replacePlaceholdersWithRequires(exportedConfig)

  return format(
    `
    import { createRequire } from "module";
    const require = createRequire(import.meta.url);
    export default ${moduleConfig};
  `,
    { parser: "typescript" }
  )
}

export function ruleSorter(a: string, b: string) {
  if (a.includes("/") && !b.includes("/")) {
    return 1
  }

  if (!a.includes("/") && b.includes("/")) {
    return -1
  }

  return a.localeCompare(b)
}

function getRulePackage(ruleName: string) {
  if (ruleName.includes("/")) {
    return ruleName.split("/")[0]
  }
}

function cleanupRules(generatedConfig: Linter.Config) {
  const rules = generatedConfig.rules
  if (!rules) {
    return generatedConfig
  }

  const ruleNames = Object.keys(rules).sort(ruleSorter)
  const ignoredPlugins = new Set([
    "@babel",
    "babel",
    "vue",
    "flowtype",
    "@stylistic"
  ])

  const cleanRules: typeof rules = {}

  for (const ruleName of ruleNames) {
    const rulePackage = getRulePackage(ruleName)
    if (rulePackage && ignoredPlugins.has(rulePackage)) {
      continue
    }

    const value = rules[ruleName]
    if (value != null && Array.isArray(value)) {
      const level = value[0]
      // Skip disabled rules (level 0)
      if (level === 0) {
        continue
      }

      const levelStr = level === 2 ? "error" : "warn"
      if (value.length === 1) {
        cleanRules[ruleName] = levelStr
      } else {
        const ruleOptions = value.slice(1) as unknown[]
        cleanRules[ruleName] = [levelStr, ...ruleOptions]
      }
    }
  }

  generatedConfig.rules = cleanRules

  return generatedConfig
}

/**
 * Cleans up the plugins object by replacing the actual plugin object with placeholders for the corresponding require statements.
 */
function cleanupPlugins(plugins?: Record<string, ESLint.Plugin>) {
  if (!plugins) {
    return
  }

  const result: Record<string, string> = {}
  Object.keys(plugins).forEach((plugin) => {
    const name = plugin.split(":")[0]
    if (name === "@") {
      return
    }
    let pkg = name
    if (name.startsWith("@")) {
      pkg = name + "/eslint-plugin"
    } else {
      pkg = "eslint-plugin-" + name
    }

    result[name] = `[[[${pkg}]]]`
  })

  return result
}

/**
 * Replaces all triple-bracket placeholders in a JSON string with require statements.
 */
function replacePlaceholdersWithRequires(jsonStr: string): string {
  // Regular expression to match any string value in JSON that is enclosed in triple brackets
  const placeholderRegex = /"(\[\[\[([a-z0-9\-@/.]+)\]\]\])"/gi

  // Replace each placeholder with the corresponding require statement
  const replacedStr = jsonStr.replace(
    placeholderRegex,
    (_match, _p1, moduleName: string) => {
      // Return the require statement without quotes
      return `require("${moduleName}")`
    }
  )

  return replacedStr
}
