import type { MetaFunction } from "react-router"

import { AiSection } from "../components/home/AiSection"
import { ClosingSection } from "../components/home/ClosingSection"
import { DeterminismSection } from "../components/home/DeterminismSection"
import { FlagConfigurator } from "../components/home/FlagConfigurator"
import { Hero } from "../components/home/Hero"
import { OxlintSection } from "../components/home/OxlintSection"
import { ReceiptsSection } from "../components/home/ReceiptsSection"

export const meta: MetaFunction = () => [
  { title: "ESLint Config Setup" },
  {
    name: "description",
    content:
      "Pre-generated ESLint flat configs for TypeScript and React. Four flags pick from 16 configs built and tested ahead of time — accelerated by OxLint.",
  },
]

export default function HomePage() {
  return (
    <div className="hp-page">
      <Hero />
      <FlagConfigurator />
      <DeterminismSection />
      <OxlintSection />
      <AiSection />
      <ReceiptsSection />
      <ClosingSection />
    </div>
  )
}
