import { useState } from "react"

import type { FlagState } from "../../lib/configStats"

import { getPermutation } from "../../lib/configStats"
import { ConfigReadout } from "./ConfigReadout"
import { FLAG_METADATA } from "./configuratorData"
import { FlagSwitch } from "./FlagSwitch"
import { RuleLedger } from "./RuleLedger"

const DEFAULT_FLAGS: FlagState = {
  react: true,
  node: false,
  ai: false,
  oxlint: false,
}

/**
 * The interactive centerpiece: four switches select one of the 16
 * pre-generated configs. Everything below the switches is derived
 * synchronously from state — no effects, no timers.
 */
export function FlagConfigurator() {
  const [flags, setFlags] = useState<FlagState>(DEFAULT_FLAGS)
  const stats = getPermutation(flags)

  function toggle(id: keyof FlagState) {
    setFlags((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <section aria-labelledby="hp-configurator-title" className="hp-section">
      <div className="hp-container">
        <div className="hp-section-head">
          <h2 className="hp-section-title" id="hp-configurator-title">
            Four flags. Sixteen configs. Yours already exists.
          </h2>
        </div>
        <p className="hp-section-lead">
          Flip the flags. You&apos;re not composing a config — you&apos;re selecting one
          of 16 that were generated, hashed, and tested before this package was
          published.
        </p>
        <div className="hp-configurator">
          <div className="hp-configurator-switches">
            {FLAG_METADATA.map((meta) => (
              <FlagSwitch
                checked={flags[meta.id]}
                description={meta.description}
                key={meta.id}
                label={meta.label}
                onToggle={() => {
                  toggle(meta.id)
                }}
              />
            ))}
          </div>
          <div className="hp-configurator-output">
            <ConfigReadout flags={flags} stats={stats} />
            {stats.oxlint ? (
              <RuleLedger split={stats.oxlint} total={stats.activeRules} />
            ) : null}
          </div>
        </div>
        <p className="hp-section-close">
          Same flags, same bytes — on your laptop, in CI, six months from now.
        </p>
      </div>
    </section>
  )
}
