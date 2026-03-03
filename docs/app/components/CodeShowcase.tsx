import { CodeBlock } from "ardo"

export function CodeShowcase() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <h2 className="hp-section-title hp-animate">
          One API. Every scenario.
        </h2>
        <p className="hp-section-subtitle hp-animate">
          Toggle flags, fine-tune rules with helper functions — the config
          handles the rest.
        </p>
        <div className="hp-showcase hp-animate">
          <input
            type="radio"
            name="hp-showcase-tab"
            id="hp-tab-react"
            className="hp-showcase-radio"
            defaultChecked
          />
          <input
            type="radio"
            name="hp-showcase-tab"
            id="hp-tab-ai"
            className="hp-showcase-radio"
          />
          <input
            type="radio"
            name="hp-showcase-tab"
            id="hp-tab-oxlint"
            className="hp-showcase-radio"
          />
          <input
            type="radio"
            name="hp-showcase-tab"
            id="hp-tab-fullstack"
            className="hp-showcase-radio"
          />
          <input
            type="radio"
            name="hp-showcase-tab"
            id="hp-tab-custom"
            className="hp-showcase-radio"
          />

          <div className="hp-tabs">
            <label htmlFor="hp-tab-react" className="hp-tab">
              React
            </label>
            <label htmlFor="hp-tab-ai" className="hp-tab">
              AI Mode
            </label>
            <label htmlFor="hp-tab-oxlint" className="hp-tab">
              OxLint
            </label>
            <label htmlFor="hp-tab-fullstack" className="hp-tab">
              Full-Stack
            </label>
            <label htmlFor="hp-tab-custom" className="hp-tab">
              Custom
            </label>
          </div>

          <div className="hp-code-block">
            <div className="hp-code-header">
              <span className="hp-code-dot" />
              <span className="hp-code-dot" />
              <span className="hp-code-dot" />
              <span>eslint.config.js</span>
            </div>
            <div className="hp-showcase-panels">
              <div className="hp-showcase-panel">
                <CodeBlock language="javascript">{`
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true
})
                `}</CodeBlock>
              </div>
              <div className="hp-showcase-panel">
                <CodeBlock language="javascript">{`
import { getEslintConfig } from "eslint-config-setup"

// Strict guardrails for AI-generated code:
// explicit types, no magic values, complexity limits
export default await getEslintConfig({
  react: true,
  ai: true
})
                `}</CodeBlock>
              </div>
              <div className="hp-showcase-panel">
                <CodeBlock language="javascript">{`
import { getEslintConfig } from "eslint-config-setup"

// 50-100x faster — rules OxLint covers are
// automatically disabled in ESLint
export default await getEslintConfig({
  react: true,
  oxlint: true
})
                `}</CodeBlock>
              </div>
              <div className="hp-showcase-panel">
                <CodeBlock language="javascript">{`
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true,
  node: true
})
                `}</CodeBlock>
              </div>
              <div className="hp-showcase-panel">
                <CodeBlock language="javascript">{`
import {
  getEslintConfig,
  disableRule,
  setRuleSeverity
} from "eslint-config-setup"

const config = await getEslintConfig({ react: true })

disableRule(config, "unicorn/no-null")
setRuleSeverity(config, "no-console", "warn", {
  scope: "scripts"
})

export default config
                `}</CodeBlock>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
