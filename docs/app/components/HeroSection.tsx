import { ArrowRight, Github } from "ardo/icons"
import { Link } from "react-router"

export function HeroSection() {
  return (
    <section className="hp-hero">
      <div className="hp-container hp-stagger">
        <h1 className="hp-hero-headline hp-animate">
          Stop configuring.
          <br />
          <span className="hp-hero-headline-accent">Start shipping.</span>
        </h1>
        <p className="hp-hero-sub hp-animate">
          27 plugins. 500+ rules. Every rule pre-resolved. AI guardrails and
          OxLint integration built in.
        </p>
        <div className="hp-animate">
          <code className="hp-hero-install">
            <span className="hp-hero-install-prefix">$</span>
            npm install -D eslint-config-setup
          </code>
        </div>
        <div className="hp-hero-actions hp-animate">
          <Link to="/guide/getting-started" className="hp-btn hp-btn-brand">
            Get Started
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com/sebastian-software/eslint-config-setup"
            className="hp-btn hp-btn-alt"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
