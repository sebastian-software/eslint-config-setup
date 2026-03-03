import { ArrowRight } from "ardo/icons"
import { Link } from "react-router"

export function CTAFooter() {
  return (
    <section className="hp-cta">
      <div className="hp-container hp-stagger">
        <h2 className="hp-cta-headline hp-animate">Ready in 30 seconds</h2>
        <p className="hp-cta-sub hp-animate">
          Install, import, ship. That's the whole setup.
        </p>
        <div className="hp-animate">
          <code className="hp-cta-install">
            <span className="hp-hero-install-prefix">$</span>
            npm install -D eslint-config-setup
          </code>
        </div>
        <div className="hp-animate">
          <Link to="/guide/getting-started" className="hp-cta-link">
            Read the getting started guide <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
