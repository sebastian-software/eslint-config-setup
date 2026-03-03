const stats = [
  { number: "27", label: "Plugins" },
  { number: "400+", label: "Rules" },
  { number: "16", label: "Pre-Built Configs" },
  { number: "2", label: "Lines to Setup" },
]

export function StatsBar() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <div className="hp-stats hp-animate">
          {stats.map((stat) => (
            <div key={stat.label} className="hp-stat">
              <div className="hp-stat-number">{stat.number}</div>
              <div className="hp-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
