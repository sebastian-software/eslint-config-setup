import { brandMap } from "./BrandLogos"
import type { ReactNode } from "react"

interface Plugin {
  name: string
  color: string
  /** Short label for tile display (defaults to name) */
  label?: string
}

interface Category {
  title: string
  plugins: Plugin[]
}

const categories: Category[] = [
  {
    title: "TypeScript",
    plugins: [
      { name: "TypeScript ESLint", label: "TypeScript", color: "#3178c6" },
    ],
  },
  {
    title: "React Ecosystem",
    plugins: [
      { name: "React", color: "#61dafb" },
      { name: "React Hooks", label: "Hooks", color: "#61dafb" },
      { name: "React Refresh", label: "Refresh", color: "#61dafb" },
      { name: "No Unnecessary Effect", label: "No Effect", color: "#61dafb" },
      { name: "JSX a11y", label: "a11y", color: "#61dafb" },
      { name: "Storybook", color: "#ff4785" },
      { name: "Testing Library", label: "Testing Lib", color: "#e33332" },
    ],
  },
  {
    title: "Code Quality",
    plugins: [
      { name: "ESLint", color: "#4b32c3" },
      { name: "Unicorn", color: "#7c3aed" },
      { name: "SonarJS", color: "#cb3032" },
      { name: "RegExp", color: "#10b981" },
      { name: "De Morgan", color: "#10b981" },
      { name: "Unused Imports", label: "Unused", color: "#f59e0b" },
      { name: "Security", color: "#ef4444" },
    ],
  },
  {
    title: "Style & Formatting",
    plugins: [
      { name: "Prettier", color: "#f7b93e" },
      { name: "Import-X", color: "#8b5cf6" },
      { name: "Perfectionist", color: "#8b5cf6" },
      { name: "JSDoc", color: "#006dcc" },
    ],
  },
  {
    title: "Compat & Testing",
    plugins: [
      { name: "Node.js", label: "Node.js", color: "#5fa04e" },
      { name: "Compat", color: "#0ea5e9" },
      { name: "OxLint", color: "#f97316" },
      { name: "Vitest", color: "#6e9f18" },
      { name: "Playwright", color: "#2ead33" },
    ],
  },
  {
    title: "File Formats",
    plugins: [
      { name: "JSON", color: "#64748b" },
      { name: "MDX", color: "#fcb32c" },
      { name: "Package JSON", label: "package.json", color: "#64748b" },
      { name: "CSpell", color: "#0ea5e9" },
    ],
  },
]

function PluginTile({ plugin }: { plugin: Plugin }) {
  const brand = brandMap[plugin.name]
  const label = plugin.label ?? plugin.name

  return (
    <div
      className="hp-eco-tile"
      style={{ "--hp-tile-color": plugin.color } as React.CSSProperties}
    >
      <div className="hp-eco-tile-icon">
        {brand ? (
          <brand.logo size={28} />
        ) : (
          <span className="hp-eco-tile-dot" />
        )}
      </div>
      <span className="hp-eco-tile-label">{label}</span>
    </div>
  )
}

export function PluginEcosystem() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <h2 className="hp-section-title hp-animate">The ecosystem, unified</h2>
        <p className="hp-section-subtitle hp-animate">
          Every plugin pre-configured, conflict-free, and kept up to date.
        </p>
        <div className="hp-eco-categories hp-stagger">
          {categories.map((cat) => (
            <div key={cat.title} className="hp-eco-group hp-animate">
              <h3 className="hp-eco-group-title">{cat.title}</h3>
              <div className="hp-eco-group-tiles">
                {cat.plugins.map((p) => (
                  <PluginTile key={p.name} plugin={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
