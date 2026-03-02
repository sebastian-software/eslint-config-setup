import { brandMap } from "./BrandLogos"

interface Plugin {
  name: string
  color: string
}

const plugins: Plugin[] = [
  // TypeScript
  { name: "TypeScript ESLint", color: "#3178c6" },
  // React
  { name: "React", color: "#61dafb" },
  { name: "React Hooks", color: "#61dafb" },
  { name: "React Refresh", color: "#61dafb" },
  { name: "No Unnecessary Effect", color: "#61dafb" },
  { name: "JSX a11y", color: "#61dafb" },
  { name: "Storybook", color: "#ff4785" },
  { name: "Testing Library", color: "#e33332" },
  // Quality
  { name: "Unicorn", color: "#7c3aed" },
  { name: "SonarJS", color: "#cb3032" },
  { name: "RegExp", color: "#10b981" },
  { name: "De Morgan", color: "#10b981" },
  { name: "Unused Imports", color: "#f59e0b" },
  // Style
  { name: "Prettier", color: "#f7b93e" },
  { name: "Import-X", color: "#8b5cf6" },
  { name: "Perfectionist", color: "#8b5cf6" },
  { name: "JSDoc", color: "#006dcc" },
  // Security
  { name: "Security", color: "#ef4444" },
  // Compat
  { name: "Compat", color: "#0ea5e9" },
  { name: "Node.js", color: "#5fa04e" },
  { name: "OxLint", color: "#f97316" },
  { name: "Vitest", color: "#6e9f18" },
  { name: "Playwright", color: "#2ead33" },
  // Format
  { name: "JSON", color: "#64748b" },
  { name: "MDX", color: "#fcb32c" },
  { name: "Package JSON", color: "#64748b" },
  // Other
  { name: "CSpell", color: "#0ea5e9" },
]

export function PluginEcosystem() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <h2 className="hp-section-title hp-animate">The ecosystem, unified</h2>
        <p className="hp-section-subtitle hp-animate">
          Every plugin pre-configured, conflict-free, and kept up to date.
        </p>
        <div className="hp-plugin-grid hp-stagger">
          {plugins.map((p) => {
            const brand = brandMap[p.name]
            return (
              <span
                key={p.name}
                className="hp-plugin-chip hp-animate"
                style={{ "--hp-chip-color": p.color } as React.CSSProperties}
              >
                {brand ? (
                  <span className="hp-plugin-logo" style={{ color: p.color }}>
                    <brand.logo size={14} />
                  </span>
                ) : (
                  <span
                    className="hp-plugin-dot"
                    style={{ background: p.color }}
                  />
                )}
                {p.name}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
