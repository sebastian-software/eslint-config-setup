export function StatsBar() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <div className="hp-stats hp-animate">
          <div className="hp-stat">
            <div className="hp-stat-number">27</div>
            <div className="hp-stat-label">Plugins</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-number">500+</div>
            <div className="hp-stat-label">Rules</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-number">16</div>
            <div className="hp-stat-label">Pre-Built Configs</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-number">2</div>
            <div className="hp-stat-label">Lines to Setup</div>
          </div>
        </div>
      </div>
    </section>
  )
}
