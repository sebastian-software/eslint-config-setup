import type { OxlintSplit } from "../../lib/configStats"

type RuleLedgerProps = {
  split: OxlintSplit
  total: number
}

const PERCENT = 100

/**
 * The ESLint/OxLint split for the selected permutation, rendered as a single
 * proportional bar with mono numerals. Width transitions are state-driven.
 */
export function RuleLedger({ split, total }: RuleLedgerProps) {
  const oxlintShare = (split.handledRules / total) * PERCENT

  return (
    <div className="hp-ledger">
      <div aria-hidden="true" className="hp-ledger-bar">
        <span
          className="hp-ledger-segment hp-ledger-segment-oxlint"
          style={{ width: `${oxlintShare}%` }}
        />
      </div>
      <p className="hp-ledger-caption">
        OxLint runs <span className="hp-num">{split.handledRules}</span> rules at Rust
        speed · ESLint runs <span className="hp-num">{split.eslintRemaining}</span>,
        including every type-aware rule
      </p>
      <p className="hp-ledger-note">
        Split maintained automatically. You never sync anything.
      </p>
    </div>
  )
}
