import { Hero, Features } from "ardo/ui"
import { Zap, Shield, Bot, Wrench, ArrowRight, Github } from "ardo/icons"
import type { MetaFunction } from "react-router"

export const meta: MetaFunction = () => [
  { title: "eslint-config-setup — ESLint, fully configured." },
]

export default function HomePage() {
  return (
    <>
      <Hero
        name="eslint-config-setup"
        text="ESLint, fully configured."
        tagline="Pre-generated, opinionated ESLint configurations for TypeScript projects. Zero runtime overhead. Full type-checking. AI-ready."
        actions={[
          {
            text: "Get Started",
            link: "/guide/getting-started",
            theme: "brand",
            icon: <ArrowRight size={16} />,
          },
          {
            text: "View on GitHub",
            link: "https://github.com/sebastian-software/eslint-config-setup",
            theme: "alt",
            icon: <Github size={16} />,
          },
        ]}
      />
      <Features
        items={[
          {
            title: "Pre-Generated",
            icon: <Zap size={28} strokeWidth={1.5} />,
            details:
              "All 16 configurations ship as static JavaScript. No parsing, no merging, no waiting. Your editor loads instantly.",
            link: "/guide/why",
          },
          {
            title: "Full Type-Checking",
            icon: <Shield size={28} strokeWidth={1.5} />,
            details:
              "Every configuration uses TypeScript's projectService. Rules like no-floating-promises actually work. No compromises.",
            link: "/guide/whats-included",
          },
          {
            title: "AI-Ready",
            icon: <Bot size={28} strokeWidth={1.5} />,
            details:
              "Strict feedback loops that push AI to write better code. Complexity limits, size limits, and code quality rules that make AI iterate until it gets it right.",
            link: "/guide/ai-mode",
          },
          {
            title: "Fully Customizable",
            icon: <Wrench size={28} strokeWidth={1.5} />,
            details:
              "Change severity while preserving rule configuration. Add, remove, or adjust any rule with simple helper functions.",
            link: "/guide/customization",
          },
        ]}
      />
    </>
  )
}
