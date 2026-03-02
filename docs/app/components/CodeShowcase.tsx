import TabReact from "./code-snippets/tab-react.mdx"
import TabAi from "./code-snippets/tab-ai.mdx"
import TabOxlint from "./code-snippets/tab-oxlint.mdx"
import TabFullstack from "./code-snippets/tab-fullstack.mdx"
import TabCustom from "./code-snippets/tab-custom.mdx"

const tabs = [
  { id: "react", label: "React", Content: TabReact },
  { id: "ai", label: "AI Mode", Content: TabAi },
  { id: "oxlint", label: "OxLint", Content: TabOxlint },
  { id: "fullstack", label: "Full-Stack", Content: TabFullstack },
  { id: "custom", label: "Custom", Content: TabCustom },
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
              <label key={t.id} htmlFor={`hp-tab-${t.id}`} className="hp-tab">
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
            <div className="hp-showcase-panels">
              {tabs.map((t) => (
                <div key={t.id} className="hp-showcase-panel">
                  <t.Content />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
