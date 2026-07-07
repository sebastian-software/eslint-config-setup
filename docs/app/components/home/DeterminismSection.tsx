import { ArdoCodeBlock } from "ardo/ui"

const BEFORE_SNIPPET = `import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import hooksPlugin from "eslint-plugin-react-hooks"
import a11yPlugin from "eslint-plugin-jsx-a11y"
import importPlugin from "eslint-plugin-import"
import unicornPlugin from "eslint-plugin-unicorn"
import sonarjsPlugin from "eslint-plugin-sonarjs"
import securityPlugin from "eslint-plugin-security"
import prettierConfig from "eslint-config-prettier"
// …nineteen more

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  reactPlugin.configs.flat.recommended,
  hooksPlugin.configs["recommended-latest"],
  a11yPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.recommended,
  unicornPlugin.configs.recommended,
  sonarjsPlugin.configs.recommended,
  securityPlugin.configs.recommended,
  {
    rules: {
      // 120 lines of overrides, because the
      // presets above disagree with each other
    },
  },
  prettierConfig,
)`

const AFTER_SNIPPET = `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true })`

export function DeterminismSection() {
  return (
    <section aria-labelledby="hp-determinism-title" className="hp-section">
      <div className="hp-container">
        <div className="hp-section-head">
          <h2 className="hp-section-title" id="hp-determinism-title">
            Your config was decided before you installed it.
          </h2>
        </div>
        <p className="hp-section-lead">
          Most shareable configs are recipes. Every <code>eslint</code> run assembles
          them again: resolve plugins, merge presets, reconcile whatever versions
          happen to be on disk. This package ships results instead. All 16 flag
          combinations were composed, resolved to plain rules, and written to files
          before publishing. Your two lines don&apos;t build a config — they point at
          one.
        </p>
        <div className="hp-compare">
          <div className="hp-compare-before">
            <p className="hp-compare-label">A config that gets assembled every run</p>
            <ArdoCodeBlock code={BEFORE_SNIPPET} language="typescript" title="eslint.config.ts" />
          </div>
          <div className="hp-compare-after">
            <p className="hp-compare-label">A config that already happened</p>
            <ArdoCodeBlock code={AFTER_SNIPPET} language="typescript" title="eslint.config.ts" />
          </div>
        </div>
        <p className="hp-section-close">
          Want to know what a rule is set to? Don&apos;t trace a composition chain.
          Open the file and read it.
        </p>
      </div>
    </section>
  )
}
