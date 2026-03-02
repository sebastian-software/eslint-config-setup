import { CodeBlock } from "ardo/ui"

interface Tab {
  id: string
  label: string
  file: string
  code: string
}

const tabs: Tab[] = [
  {
    id: "react",
    label: "React",
    file: "eslint.config.js",
    code: `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true
})`,
  },
  {
    id: "ai",
    label: "AI Mode",
    file: "eslint.config.js",
    code: `import { getEslintConfig } from "eslint-config-setup"

// Strict guardrails for AI-generated code:
// explicit types, no magic values, complexity limits
export default await getEslintConfig({
  react: true,
  ai: true
})`,
  },
  {
    id: "oxlint",
    label: "OxLint",
    file: "eslint.config.js",
    code: `import { getEslintConfig } from "eslint-config-setup"

// 50-100x faster — rules OxLint covers are
// automatically disabled in ESLint
export default await getEslintConfig({
  react: true,
  oxlint: true
})`,
  },
  {
    id: "fullstack",
    label: "Full-Stack",
    file: "eslint.config.js",
    code: `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true,
  node: true
})`,
  },
  {
    id: "custom",
    label: "Custom",
    file: "eslint.config.js",
    code: `import {
  getEslintConfig,
  disableRule,
  setRuleSeverity
} from "eslint-config-setup"

const config = await getEslintConfig({ react: true })

disableRule(config, "unicorn/no-null")
setRuleSeverity(config, "no-console", "warn", {
  scope: "scripts"
})

export default config`,
  },
]

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
          {tabs.map((t, i) => (
            <input
              key={t.id}
              type="radio"
              name="hp-showcase-tab"
              id={`hp-tab-${t.id}`}
              className="hp-showcase-radio"
              defaultChecked={i === 0}
            />
          ))}
          <div className="hp-tabs">
            {tabs.map((t) => (
              <label
                key={t.id}
                htmlFor={`hp-tab-${t.id}`}
                className="hp-tab"
              >
                {t.label}
              </label>
            ))}
          </div>
          <div className="hp-code-block">
            <div className="hp-code-header">
              <span className="hp-code-dot" />
              <span className="hp-code-dot" />
              <span className="hp-code-dot" />
              <span>eslint.config.js</span>
            </div>
            {tabs.map((t) => (
              <div key={t.id} className="hp-showcase-panel">
                <CodeBlock code={t.code} language="javascript" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
