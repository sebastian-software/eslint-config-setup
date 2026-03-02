import {
  Zap,
  Sparkles,
  Blocks,
  Rabbit,
  SlidersHorizontal,
  Package,
} from "ardo/icons"
import type { ReactNode } from "react"

interface Feature {
  icon: ReactNode
  title: string
  desc: string
}

interface Category {
  label: string
  features: Feature[]
}

const categories: Category[] = [
  {
    label: "For AI Workflows",
    features: [
      {
        icon: <Sparkles size={20} strokeWidth={1.5} />,
        title: "AI Guardrails",
        desc: "Dedicated AI mode enforces explicit types, strict naming, no magic values, and complexity limits — rules trivial for AI to follow but humans find tedious.",
      },
      {
        icon: <Rabbit size={20} strokeWidth={1.5} />,
        title: "OxLint Integration",
        desc: "One flag enables 50-100x faster linting. Rules OxLint covers are automatically disabled in ESLint — no gaps, no conflicts, no manual wiring.",
      },
      {
        icon: <Zap size={20} strokeWidth={1.5} />,
        title: "Fast Feedback Loops",
        desc: "Pre-built configs load instantly in your editor. AI coding assistants get near-instant lint results for tight iteration cycles.",
      },
    ],
  },
  {
    label: "For Developers",
    features: [
      {
        icon: <Zap size={20} strokeWidth={1.5} />,
        title: "Zero Config",
        desc: "One import gives you TypeScript, React 19, import validation, code quality analysis, and Prettier compatibility.",
      },
      {
        icon: <SlidersHorizontal size={20} strokeWidth={1.5} />,
        title: "Fully Customizable",
        desc: "Use disableRule(), setRuleSeverity(), and addRule() to fine-tune. Scope changes to tests, scripts, configs, or any file type.",
      },
      {
        icon: <Package size={20} strokeWidth={1.5} />,
        title: "Pre-Built Configs",
        desc: "All 16 flag combinations are pre-generated at build time. No runtime composition — your editor gets results instantly.",
      },
    ],
  },
  {
    label: "For Teams",
    features: [
      {
        icon: <Blocks size={20} strokeWidth={1.5} />,
        title: "25+ Plugins, Unified",
        desc: "TypeScript, React, Unicorn, SonarJS, imports, security, spell checking, JSON, MDX — all conflict-free.",
      },
      {
        icon: <Zap size={20} strokeWidth={1.5} />,
        title: "One Standard",
        desc: "Every team member, every IDE, every CI run — identical results. No more \"works on my machine\" linting.",
      },
      {
        icon: <Sparkles size={20} strokeWidth={1.5} />,
        title: "Quality Gate That Scales",
        desc: "As AI generates more code, consistent linting catches what humans miss in review. Your safety net grows with output.",
      },
    ],
  },
]

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
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="hp-feature-category-title hp-animate">
                {cat.label}
              </div>
              <div className="hp-feature-grid hp-stagger">
                {cat.features.map((f) => (
                  <div
                    key={f.title}
                    className="hp-feature-card hp-animate"
                  >
                    <div className="hp-feature-icon">{f.icon}</div>
                    <h3 className="hp-feature-title">{f.title}</h3>
                    <p className="hp-feature-desc">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
