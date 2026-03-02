import { useState } from "react"
import { CodeBlock } from "ardo/ui"

interface Tab {
  label: string
  file: string
  code: string
}

const tabs: Tab[] = [
  {
    label: "React",
    file: "eslint.config.js",
    code: `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true
})`,
  },
  {
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
    label: "Full-Stack",
    file: "eslint.config.js",
    code: `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true,
  node: true
})`,
  },
  {
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
  const [active, setActive] = useState(0)

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
        <div className="hp-tabs hp-animate">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              className={`hp-tab ${i === active ? "hp-tab-active" : ""}`}
              onClick={() => setActive(i)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="hp-code-block hp-animate">
          <div className="hp-code-header">
            <span className="hp-code-dot" />
            <span className="hp-code-dot" />
            <span className="hp-code-dot" />
            <span>{tabs[active].file}</span>
          </div>
          {/* Render all tabs so Shiki highlights at prerender time; hide inactive */}
          {tabs.map((t, i) => (
            <div
              key={t.label}
              className="hp-showcase-panel"
              style={{ display: i === active ? "block" : "none" }}
            >
              <CodeBlock code={t.code} language="javascript" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
