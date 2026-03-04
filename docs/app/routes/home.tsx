import type { MetaFunction } from "react-router"
import { HeroSection } from "../components/HeroSection"
import { StatsBar } from "../components/StatsBar"
import { BeforeAfterSection } from "../components/BeforeAfterSection"
import { FeatureGrid } from "../components/FeatureGrid"
import { CodeShowcase } from "../components/CodeShowcase"
import { PluginEcosystem } from "../components/PluginEcosystem"
import { CTAFooter } from "../components/CTAFooter"

export const meta: MetaFunction = () => [
  { title: "ESLint Config Setup" },
  {
    name: "description",
    content:
      "One import. 27 plugins. TypeScript, React, Node.js, AI mode, OxLint — all handled.",
  },
]

export default function HomePage() {
  return (
    <div className="hp-page">
      <HeroSection />
      <StatsBar />
      <BeforeAfterSection />
      <FeatureGrid />
      <CodeShowcase />
      <PluginEcosystem />
      <CTAFooter />
    </div>
  )
}
