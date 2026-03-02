export function BeforeAfterSection() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <h2 className="hp-section-title hp-animate">
          The end of config fatigue
        </h2>
        <p className="hp-section-subtitle hp-animate">
          Replace hundreds of lines of brittle plugin wiring with a single,
          type-safe import.
        </p>
        <div className="hp-before-after hp-stagger">
          <div className="hp-ba-panel hp-animate">
            <div className="hp-ba-header hp-ba-header-before">
              <span>&#x2717;</span> Before — typical setup
            </div>
            <pre className="hp-ba-code">
              <code>{beforeCode}</code>
            </pre>
          </div>
          <div className="hp-ba-panel hp-animate">
            <div className="hp-ba-header hp-ba-header-after">
              <span>&#x2713;</span> After — eslint-config-setup
            </div>
            <pre className="hp-ba-code">
              <code>{afterCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

const beforeCode = `import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import importPlugin from "eslint-plugin-import-x"
import unicorn from "eslint-plugin-unicorn"
import sonarjs from "eslint-plugin-sonarjs"
import security from "eslint-plugin-security"
import prettier from "eslint-config-prettier"
// ... 15 more imports

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  reactPlugin.configs.flat.recommended,
  reactHooks.configs.recommended,
  importPlugin.flatConfigs.recommended,
  unicorn.configs["flat/recommended"],
  sonarjs.configs.recommended,
  security.configs.recommended,
  prettier,
  // ... 200 more lines of overrides
)`

const afterCode = `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true })`
