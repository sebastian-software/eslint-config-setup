import type { FlagState, PermutationStats } from "../../lib/configStats"

import { CodeBlock } from "./CodeBlock"
import { buildConfigSnippet } from "./configuratorData"

type ConfigReadoutProps = {
  flags: FlagState
  stats: PermutationStats
}

/**
 * The live readout for the selected permutation: the two-line user config,
 * the active rule count, and the resolved file that ships in the package.
 * The numeric readout is an `aria-live` region so flag changes are announced.
 */
export function ConfigReadout({ flags, stats }: ConfigReadoutProps) {
  return (
    <div className="hp-readout">
      <CodeBlock code={buildConfigSnippet(flags)} title="eslint.config.ts" />

      <div aria-atomic="true" aria-live="polite" className="hp-readout-stats">
        <p className="hp-readout-count">
          <span className="hp-readout-number" key={stats.hash}>
            {stats.activeRules}
          </span>{" "}
          active rules
        </p>
        <p className="hp-readout-file">
          resolves to{" "}
          <code className="hp-readout-hash" key={stats.hash}>
            {stats.filename}
          </code>{" "}
          <span className="hp-readout-size">({stats.moduleKb} KB)</span>
        </p>
      </div>
      <p className="hp-readout-note">
        This exact file ships in the package. Open it — it&apos;s a plain ES module.
      </p>
    </div>
  )
}
