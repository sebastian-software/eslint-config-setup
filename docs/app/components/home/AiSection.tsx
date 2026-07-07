import { Link } from "react-router"

import { getPermutation } from "../../lib/configStats"

const REACT_FLAGS = { react: true, node: false, ai: false, oxlint: false }
const REACT_AI_FLAGS = { react: true, node: false, ai: true, oxlint: false }

export function AiSection() {
  const withoutAi = getPermutation(REACT_FLAGS).activeRules
  const withAi = getPermutation(REACT_AI_FLAGS).activeRules

  return (
    <section aria-labelledby="hp-ai-title" className="hp-section">
      <div className="hp-container">
        <div className="hp-section-head">
          <h2 className="hp-section-title" id="hp-ai-title">
            Rules humans find tedious. The AI doesn’t mind.
          </h2>
        </div>
        <p className="hp-section-lead">
          Agents write a lot of code, and they write it in whatever style the last
          token suggested — until the codebase looks like it was written by a
          different person every hour. Because it was. The <code>ai</code> flag turns
          on the enforcement no team would impose on people: tighter complexity
          budgets, exhaustive ordering, naming discipline everywhere. A linter
          doesn’t get tired of giving that feedback, and an agent doesn’t
          get tired of receiving it.
        </p>
        <p className="hp-ai-figures">
          On a React project the count only moves from{" "}
          <span className="hp-num">{withoutAi}</span> to{" "}
          <span className="hp-num">{withAi}</span> active rules — the flag&apos;s real
          work is tightening rules that are already on: stricter options, lower
          thresholds, fewer exceptions.{" "}
          <Link to="/guide/ai-mode">What the AI mode adds</Link>
        </p>
        <p className="hp-ai-strip">
          Installing with an agent? Point it at <code>llms.txt</code> — the package
          ships an <Link to="/guide/agent-install">agent contract</Link> instead of an
          install wizard.
        </p>
      </div>
    </section>
  )
}
