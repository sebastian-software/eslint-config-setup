import type { ReactNode } from "react"

import {
  Blocks,
  Package,
  Rabbit,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "ardo/icons"

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="hp-feature-card hp-animate">
      <div className="hp-feature-icon">{icon}</div>
      <h3 className="hp-feature-title">{title}</h3>
      <p className="hp-feature-desc">{description}</p>
    </div>
  )
}

export function FeatureGrid() {
  return (
    <section className="hp-section">
      <div className="hp-container">
        <h2 className="hp-section-title hp-animate">
          Built for AI-assisted development
        </h2>
        <p className="hp-section-subtitle hp-animate">
          Most ESLint configs were built for a world where humans write all the
          code. That world is over.
        </p>
        <div className="hp-feature-categories">
          <div>
            <div className="hp-feature-category-title hp-animate">
              For AI Workflows
            </div>
            <div className="hp-feature-grid hp-stagger">
              <FeatureCard
                icon={<Sparkles size={20} strokeWidth={1.5} />}
                title="AI Guardrails"
                description="Dedicated AI mode enforces explicit types, strict naming, no magic values, and complexity limits. AI tools can follow those rules without slowing down review."
              />
              <FeatureCard
                icon={<Rabbit size={20} strokeWidth={1.5} />}
                title="OxLint Integration"
                description="One flag splits supported rules to OxLint. Rules OxLint covers are automatically disabled in ESLint, with no duplicate diagnostics or manual wiring."
              />
              <FeatureCard
                icon={<Zap size={20} strokeWidth={1.5} />}
                title="Fast Feedback Loops"
                description="Pre-resolved configs load quickly. AI coding assistants get consistent lint results because every rule is already decided before your editor starts."
              />
            </div>
          </div>

          <div>
            <div className="hp-feature-category-title hp-animate">
              For Developers
            </div>
            <div className="hp-feature-grid hp-stagger">
              <FeatureCard
                icon={<Zap size={20} strokeWidth={1.5} />}
                title="Zero Config"
                description="One import gives you TypeScript, React 19, import validation, code quality analysis, and Prettier compatibility."
              />
              <FeatureCard
                icon={<SlidersHorizontal size={20} strokeWidth={1.5} />}
                title="Fully Customizable"
                description="Use disableRule(), setRuleSeverity(), and addRule() to fine-tune. Scope changes to tests, scripts, configs, or any file type."
              />
              <FeatureCard
                icon={<Package size={20} strokeWidth={1.5} />}
                title="Pre-Built Configs"
                description="Every supported flag combination is pre-generated with each rule already resolved. No runtime composition, no plugin conflicts, fast editor feedback."
              />
            </div>
          </div>

          <div>
            <div className="hp-feature-category-title hp-animate">
              For Teams
            </div>
            <div className="hp-feature-grid hp-stagger">
              <FeatureCard
                icon={<Blocks size={20} strokeWidth={1.5} />}
                title="Included Plugins, Unified"
                description="TypeScript, React, Unicorn, SonarJS, imports, security, spell checking, JSON, and MDX are pre-resolved into one consistent rule set."
              />
              <FeatureCard
                icon={<Zap size={20} strokeWidth={1.5} />}
                title="One Standard"
                description='Every team member, every IDE, every CI run gets the same result. No more "works on my machine" linting.'
              />
              <FeatureCard
                icon={<Sparkles size={20} strokeWidth={1.5} />}
                title="Quality Gate That Scales"
                description="As AI generates more code, consistent linting catches what humans miss in review. Your safety net grows with output."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
