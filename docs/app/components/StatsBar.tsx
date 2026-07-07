export function StatsBar() {
  return (
    <section className="hp-trust-section">
      <div className="hp-container">
        <div className="hp-trust hp-animate">
          <div className="hp-trust-intro">
            <p className="hp-kicker">Proof points</p>
            <h2>Built like infrastructure, not a snippet collection.</h2>
            <p>
              The public package, generated outputs, CI workflows, and ADRs are
              all part of the same repo, so the homepage story maps back to
              shipped behavior.
            </p>
          </div>
          <div className="hp-trust-grid">
            <div className="hp-trust-card">
              <div className="hp-trust-label">Published package</div>
              <div className="hp-trust-copy">
                Installed through the normal npm workflow with one import.
              </div>
            </div>
            <div className="hp-trust-card">
              <div className="hp-trust-label">Generated configs</div>
              <div className="hp-trust-copy">
                Supported flag combinations are built ahead of editor startup.
              </div>
            </div>
            <div className="hp-trust-card">
              <div className="hp-trust-label">Snapshot coverage</div>
              <div className="hp-trust-copy">
                Rule output changes are reviewed as concrete generated diffs.
              </div>
            </div>
            <div className="hp-trust-card">
              <div className="hp-trust-label">Public decisions</div>
              <div className="hp-trust-copy">
                ADRs document choices around AI mode, OxLint, and code
                generation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
