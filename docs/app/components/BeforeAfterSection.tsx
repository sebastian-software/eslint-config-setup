import BeforeCode from "./code-snippets/before.mdx"
import AfterCode from "./code-snippets/after.mdx"

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
            <div className="hp-ba-code-wrap">
              <BeforeCode />
            </div>
          </div>
          <div className="hp-ba-panel hp-animate">
            <div className="hp-ba-header hp-ba-header-after">
              <span>&#x2713;</span> After — eslint-config-setup
            </div>
            <div className="hp-ba-code-wrap">
              <AfterCode />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
