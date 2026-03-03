import TabReact from "./code-snippets/tab-react.mdx"
import TabAi from "./code-snippets/tab-ai.mdx"
import TabOxlint from "./code-snippets/tab-oxlint.mdx"
import TabFullstack from "./code-snippets/tab-fullstack.mdx"
import TabCustom from "./code-snippets/tab-custom.mdx"

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
                <TabReact />
              </div>
              <div className="hp-showcase-panel">
                <TabAi />
              </div>
              <div className="hp-showcase-panel">
                <TabOxlint />
              </div>
              <div className="hp-showcase-panel">
                <TabFullstack />
              </div>
              <div className="hp-showcase-panel">
                <TabCustom />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
