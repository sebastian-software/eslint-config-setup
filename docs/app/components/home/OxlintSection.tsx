import { Link } from "react-router"

import { getPermutation } from "../../lib/configStats"

const ALL_FLAGS = { react: true, node: true, ai: true, oxlint: true }

export function OxlintSection() {
  const stats = getPermutation(ALL_FLAGS)
  const split = stats.oxlint

  return (
    <section aria-labelledby="hp-oxlint-title" className="hp-section">
      <div className="hp-container">
        <div className="hp-section-head">
          <h2 className="hp-section-title" id="hp-oxlint-title">
            Two linters. One ruleset. Nothing to keep in sync.
          </h2>
        </div>
        <p className="hp-section-lead">
          Turn on the <code>oxlint</code> flag and every rule OxLint implements is
          switched off in ESLint and handed to Rust. The split is computed at build
          time with <code>@oxlint/migrate</code> — not curated by hand, never out of
          date. A compat plugin maps the React rules to their OxLint names, so they
          accelerate too. ESLint keeps what only ESLint can do: type-aware analysis
          and the long tail of specialized plugins.
        </p>
        {split ? (
          <p className="hp-oxlint-figures">
            With every flag on, <span className="hp-num">{split.handledRules}</span> of{" "}
            <span className="hp-num">{stats.activeRules}</span> active rules run in
            Rust, and <span className="hp-num">{split.eslintRemaining}</span> stay in
            ESLint — including all type-aware rules.{" "}
            <Link to="/guide/oxlint">How the split works</Link>
          </p>
        ) : null}
        <p className="hp-section-close">
          This is what linting looks like next: you just get it now.
        </p>
      </div>
    </section>
  )
}
