import { ArdoCodeBlock as CodeBlock } from "ardo"

const scenarios = [
  {
    id: "react",
    label: "React app",
    headline: "React defaults without plugin wiring",
    description:
      "For teams that want TypeScript, React, imports, quality rules, and Prettier compatibility behind one call.",
    enabled: ["react"],
    note: "Best first step for product apps that want a curated baseline.",
    code: `
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true
})
    `,
  },
  {
    id: "ai",
    label: "React + AI",
    headline: "Stricter review surface for generated code",
    description:
      "Adds AI-focused checks for explicit types, naming, magic values, and complexity so generated code is easier to review.",
    enabled: ["react", "ai"],
    note: "Use when agents regularly open branches or draft implementation code.",
    code: `
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true,
  ai: true
})
    `,
  },
  {
    id: "oxlint",
    label: "React + OxLint",
    headline: "Split the fast path cleanly",
    description:
      "Lets OxLint cover supported rules while ESLint keeps the curated ecosystem checks without duplicate diagnostics.",
    enabled: ["react", "oxlint"],
    note: "Use when local feedback speed matters but you still want ESLint depth.",
    code: `
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true,
  oxlint: true
})
    `,
  },
  {
    id: "fullstack",
    label: "Full-stack",
    headline: "One setup for browser and server code",
    description:
      "Combines React and Node.js decisions so shared repos do not drift between frontend and backend lint behavior.",
    enabled: ["react", "node"],
    note: "Use for apps with route handlers, scripts, workers, or server modules.",
    code: `
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({
  react: true,
  node: true
})
    `,
  },
  {
    id: "custom",
    label: "Rule API",
    headline: "Keep the baseline, tune the edge cases",
    description:
      "Helper functions let teams override specific rules by scope without ejecting from the generated setup.",
    enabled: ["react", "rule helpers"],
    note: "Use when a team agrees with the defaults but needs project-specific exceptions.",
    code: `
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
    `,
  },
]

export function CodeShowcase() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <h2 className="hp-section-title hp-animate">
          Choose the setup that matches your repo
        </h2>
        <p className="hp-section-subtitle hp-animate">
          The API stays small, but each scenario changes the generated config
          in a concrete way.
        </p>
        <div className="hp-showcase hp-animate">
          {scenarios.map((scenario, index) => (
            <input
              type="radio"
              name="hp-showcase-tab"
              id={`hp-tab-${scenario.id}`}
              className="hp-showcase-radio"
              defaultChecked={index === 0}
              key={scenario.id}
            />
          ))}

          <div className="hp-tabs">
            {scenarios.map((scenario) => (
              <label
                htmlFor={`hp-tab-${scenario.id}`}
                className="hp-tab"
                key={scenario.id}
              >
                {scenario.label}
              </label>
            ))}
          </div>

          <div className="hp-configurator-shell">
            <div className="hp-showcase-panels">
              {scenarios.map((scenario) => (
                <div className="hp-showcase-panel" key={scenario.id}>
                  <div className="hp-configurator-layout">
                    <div className="hp-configurator-copy">
                      <p className="hp-kicker">Scenario</p>
                      <h3>{scenario.headline}</h3>
                      <p>{scenario.description}</p>
                      <div className="hp-configurator-flags">
                        {scenario.enabled.map((flag) => (
                          <span key={flag}>{flag}</span>
                        ))}
                      </div>
                      <p className="hp-configurator-note">{scenario.note}</p>
                    </div>
                    <div className="hp-code-block">
                      <div className="hp-code-header">
                        <span className="hp-code-dot" />
                        <span className="hp-code-dot" />
                        <span className="hp-code-dot" />
                        <span>eslint.config.js</span>
                      </div>
                      <CodeBlock language="javascript">{scenario.code}</CodeBlock>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
