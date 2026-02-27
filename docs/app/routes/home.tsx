import { Hero, Features } from "ardo/ui"
import {
  Zap,
  Sparkles,
  Blocks,
  Rabbit,
  SlidersHorizontal,
  Package,
  ArrowRight,
  Github,
} from "ardo/icons"
import type { MetaFunction } from "react-router"

export const meta: MetaFunction = () => [
  { title: "@effective/eslint-config" },
  {
    name: "description",
    content:
      "One import. 25+ plugins. TypeScript, React, Node.js, AI-assisted code, OxLint — all handled.",
  },
]

export default function HomePage() {
  return (
    <>
      <Hero
        name="@effective/eslint-config"
        text="Stop managing ESLint configs. Start shipping."
        tagline="One import. 25+ plugins. TypeScript, React, Node.js, AI-assisted code, OxLint — all handled. Every combination pre-built at compile time, so your editor never waits."
        actions={[
          {
            text: "Get Started",
            link: "/guide/getting-started",
            theme: "brand",
            icon: <ArrowRight size={16} />,
          },
          {
            text: "GitHub",
            link: "https://github.com/sebastian-software/effective-eslint-config",
            theme: "alt",
            icon: <Github size={16} />,
          },
        ]}
      />
      <Features
        items={[
          {
            title: "Zero Config",
            icon: <Zap size={28} strokeWidth={1.5} />,
            details:
              "One import gives you type-checked TypeScript, React 19, import validation, code quality analysis, and Prettier compatibility.",
          },
          {
            title: "AI-Ready",
            icon: <Sparkles size={28} strokeWidth={1.5} />,
            details:
              "Strict rules that enforce a single standard across every contributor — human or AI. The quality gate that scales with generated code.",
          },
          {
            title: "25+ Plugins",
            icon: <Blocks size={28} strokeWidth={1.5} />,
            details:
              "TypeScript, React, Unicorn, SonarJS, imports, security, spell checking, JSON, Markdown — all pre-configured and conflict-free.",
          },
          {
            title: "OxLint Support",
            icon: <Rabbit size={28} strokeWidth={1.5} />,
            details:
              "Enable 50-100x faster linting with one flag. Rules OxLint covers are automatically disabled in ESLint — no gaps, no conflicts.",
          },
          {
            title: "Fully Customizable",
            icon: <SlidersHorizontal size={28} strokeWidth={1.5} />,
            details:
              "Disable, reconfigure, or add rules with a simple API. Scope changes to tests, scripts, configs, or any file type.",
          },
          {
            title: "Pre-Built Configs",
            icon: <Package size={28} strokeWidth={1.5} />,
            details:
              "All 16 flag combinations are pre-generated at build time. No composition at runtime — your editor gets results instantly.",
          },
        ]}
      />
    </>
  )
}
