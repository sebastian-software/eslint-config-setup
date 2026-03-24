import { ArrowRight } from "ardo/icons"
import { Link } from "react-router"

function GitHubMarkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297a12 12 0 0 0-3.79 23.39c.6.112.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61a3.18 3.18 0 0 0-1.334-1.756c-1.09-.745.083-.73.083-.73a2.52 2.52 0 0 1 1.84 1.237 2.55 2.55 0 0 0 3.486.995 2.56 2.56 0 0 1 .76-1.6c-2.665-.303-5.466-1.334-5.466-5.933a4.64 4.64 0 0 1 1.235-3.218 4.31 4.31 0 0 1 .117-3.176s1.008-.322 3.3 1.23a11.46 11.46 0 0 1 6.006 0c2.29-1.552 3.295-1.23 3.295-1.23a4.31 4.31 0 0 1 .12 3.176 4.63 4.63 0 0 1 1.232 3.218c0 4.61-2.805 5.626-5.478 5.922a2.87 2.87 0 0 1 .817 2.226v3.3c0 .32.216.694.825.576A12 12 0 0 0 12 .297Z" />
    </svg>
  )
}

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
            <GitHubMarkIcon />
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
