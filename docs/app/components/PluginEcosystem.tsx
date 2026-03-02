interface Plugin {
  name: string
  category: string
}

const plugins: Plugin[] = [
  // TypeScript
  { name: "TypeScript ESLint", category: "hp-plugin-ts" },
  // React
  { name: "React", category: "hp-plugin-react" },
  { name: "React Hooks", category: "hp-plugin-react" },
  { name: "React Refresh", category: "hp-plugin-react" },
  { name: "No Unnecessary Effect", category: "hp-plugin-react" },
  { name: "JSX a11y", category: "hp-plugin-react" },
  { name: "Storybook", category: "hp-plugin-react" },
  { name: "Testing Library", category: "hp-plugin-react" },
  // Quality
  { name: "Unicorn", category: "hp-plugin-quality" },
  { name: "SonarJS", category: "hp-plugin-quality" },
  { name: "RegExp", category: "hp-plugin-quality" },
  { name: "De Morgan", category: "hp-plugin-quality" },
  { name: "Unused Imports", category: "hp-plugin-quality" },
  // Style
  { name: "Prettier", category: "hp-plugin-style" },
  { name: "Import-X", category: "hp-plugin-style" },
  { name: "Perfectionist", category: "hp-plugin-style" },
  { name: "JSDoc", category: "hp-plugin-style" },
  // Security
  { name: "Security", category: "hp-plugin-security" },
  // Compat
  { name: "Compat", category: "hp-plugin-compat" },
  { name: "Node.js", category: "hp-plugin-compat" },
  { name: "OxLint", category: "hp-plugin-compat" },
  { name: "Vitest", category: "hp-plugin-compat" },
  { name: "Playwright", category: "hp-plugin-compat" },
  // Format
  { name: "JSON", category: "hp-plugin-format" },
  { name: "MDX", category: "hp-plugin-format" },
  { name: "Package JSON", category: "hp-plugin-format" },
  // Other
  { name: "CSpell", category: "hp-plugin-perf" },
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
          {plugins.map((p) => (
            <span
              key={p.name}
              className={`hp-plugin-chip hp-animate ${p.category}`}
            >
              <span className="hp-plugin-dot" />
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
