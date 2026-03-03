import { brandMap } from "./BrandLogos"

function PluginTile({
  name,
  label,
  color,
}: {
  name: string
  label?: string
  color: string
}) {
  const brand = brandMap[name]

  return (
    <div
      className="hp-eco-tile"
      style={{ "--hp-tile-color": color } as React.CSSProperties}
    >
      <div className="hp-eco-tile-icon">
        {brand ? (
          <brand.logo size={28} />
        ) : (
          <span className="hp-eco-tile-dot" />
        )}
      </div>
      <span className="hp-eco-tile-label">{label ?? name}</span>
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
          <div className="hp-eco-group hp-animate">
            <h3 className="hp-eco-group-title">React Ecosystem</h3>
            <div className="hp-eco-group-tiles">
              <PluginTile name="React" color="#61dafb" />
              <PluginTile name="React Hooks" label="Hooks" color="#61dafb" />
              <PluginTile
                name="React Refresh"
                label="Refresh"
                color="#61dafb"
              />
              <PluginTile
                name="No Unnecessary Effect"
                label="No Effect"
                color="#61dafb"
              />
              <PluginTile name="JSX a11y" label="a11y" color="#61dafb" />
              <PluginTile name="Storybook" color="#ff4785" />
              <PluginTile
                name="Testing Library"
                label="Testing Lib"
                color="#e33332"
              />
            </div>
          </div>

          <div className="hp-eco-group hp-animate">
            <h3 className="hp-eco-group-title">Code Quality</h3>
            <div className="hp-eco-group-tiles">
              <PluginTile name="ESLint" color="#4b32c3" />
              <PluginTile name="Unicorn" color="#7c3aed" />
              <PluginTile name="SonarJS" color="#cb3032" />
              <PluginTile name="RegExp" color="#10b981" />
              <PluginTile name="De Morgan" color="#10b981" />
              <PluginTile name="Unused Imports" label="Unused" color="#f59e0b" />
              <PluginTile name="Security" color="#ef4444" />
              <PluginTile name="CSpell" color="#0ea5e9" />
            </div>
          </div>

          <div className="hp-eco-group hp-animate">
            <h3 className="hp-eco-group-title">Style &amp; Formatting</h3>
            <div className="hp-eco-group-tiles">
              <PluginTile name="Prettier" color="#f7b93e" />
              <PluginTile name="Import-X" color="#8b5cf6" />
              <PluginTile name="Perfectionist" color="#8b5cf6" />
              <PluginTile name="JSDoc" color="#006dcc" />
            </div>
          </div>

          <div className="hp-eco-group hp-animate">
            <h3 className="hp-eco-group-title">Compat &amp; Testing</h3>
            <div className="hp-eco-group-tiles">
              <PluginTile name="Node.js" color="#5fa04e" />
              <PluginTile name="Compat" color="#0ea5e9" />
              <PluginTile name="OxLint" color="#f97316" />
              <PluginTile name="Vitest" color="#6e9f18" />
              <PluginTile name="Playwright" color="#2ead33" />
            </div>
          </div>

          <div className="hp-eco-group hp-animate">
            <h3 className="hp-eco-group-title">File Formats</h3>
            <div className="hp-eco-group-tiles">
              <PluginTile
                name="TypeScript ESLint"
                label="TypeScript"
                color="#3178c6"
              />
              <PluginTile name="JSON" color="#64748b" />
              <PluginTile name="MDX" color="#fcb32c" />
              <PluginTile
                name="Package JSON"
                label="package.json"
                color="#64748b"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
