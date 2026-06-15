export function StatsBar() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <div className="hp-stats hp-animate">
          <div className="hp-stat">
            <div className="hp-stat-number">Curated</div>
            <div className="hp-stat-label">Plugin Stack</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-number">Resolved</div>
            <div className="hp-stat-label">Rule Set</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-number">Pre-Built</div>
            <div className="hp-stat-label">Configs</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-number">One</div>
            <div className="hp-stat-label">Import to Start</div>
          </div>
        </div>
      </div>
    </section>
  )
}
