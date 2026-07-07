import { Link } from "react-router"

import { CodeBlock } from "./CodeBlock"
import { buildConfigSnippet, GETTING_STARTED_PATH, REPO_URL } from "./configuratorData"
import { InstallCommand } from "./InstallCommand"

const HERO_SNIPPET = buildConfigSnippet({
  react: true,
  node: false,
  ai: false,
  oxlint: false,
})
  .split("\n")
  .filter(Boolean)
  .join("\n")

export function Hero() {
  return (
    <header className="hp-hero">
      <div className="hp-container">
        <h1 className="hp-hero-title">
          <span className="hp-hero-line">It&apos;s just ESLint.</span>
          <span className="hp-hero-line">Resolved ahead of time.</span>
          <span className="hp-hero-line">Accelerated by Rust.</span>
        </h1>
        <p className="hp-hero-sub">
          Pre-generated flat configs for TypeScript and React. Four flags pick from 16
          configs built and tested ahead of time — and every rule OxLint can run moves
          to Rust automatically, with the ESLint ecosystem (type-aware rules included)
          handling the rest. No composition. No plugin resolution. No sync to maintain.
        </p>
        <InstallCommand />
        <CodeBlock className="hp-hero-config" code={HERO_SNIPPET} title="eslint.config.ts" />
        <p className="hp-hero-micro">That&apos;s the entire setup.</p>
        <p className="hp-hero-links">
          <Link to={GETTING_STARTED_PATH}>Getting Started</Link>
          <span aria-hidden="true"> · </span>
          <a href={REPO_URL} rel="noreferrer" target="_blank">
            GitHub
          </a>
        </p>
      </div>
    </header>
  )
}
