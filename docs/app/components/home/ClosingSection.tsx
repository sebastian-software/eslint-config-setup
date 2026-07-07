import { Link } from "react-router"

import { GETTING_STARTED_PATH } from "./configuratorData"
import { InstallCommand } from "./InstallCommand"

export function ClosingSection() {
  return (
    <section aria-labelledby="hp-closing-title" className="hp-section hp-closing">
      <div className="hp-container">
        <div className="hp-section-head">
          <h2 className="hp-section-title" id="hp-closing-title">
            Still just ESLint. Just already decided.
          </h2>
        </div>
        <p className="hp-section-lead">
          Sixteen configs are sitting in the package right now, tested and hashed.
          Four booleans pick yours.
        </p>
        <InstallCommand />
        <p className="hp-closing-links">
          <Link to={GETTING_STARTED_PATH}>Getting Started</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/adr">Read the 24 ADRs</Link>
        </p>
      </div>
    </section>
  )
}
