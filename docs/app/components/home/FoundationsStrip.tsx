import {
  ESLintLogo,
  NodeLogo,
  OxlintLogo,
  PlaywrightLogo,
  PrettierLogo,
  ReactLogo,
  StorybookLogo,
  TypeScriptLogo,
  VitestLogo,
} from "./logos"

type Foundation = {
  name: string
  href: string
  Logo: (props: { size?: number }) => React.JSX.Element
}

const FOUNDATIONS: Foundation[] = [
  { name: "ESLint", href: "https://eslint.org", Logo: ESLintLogo },
  { name: "OxLint", href: "https://oxc.rs", Logo: OxlintLogo },
  { name: "TypeScript", href: "https://www.typescriptlang.org", Logo: TypeScriptLogo },
  { name: "React", href: "https://react.dev", Logo: ReactLogo },
  { name: "Node.js", href: "https://nodejs.org", Logo: NodeLogo },
  { name: "Prettier", href: "https://prettier.io", Logo: PrettierLogo },
  { name: "Vitest", href: "https://vitest.dev", Logo: VitestLogo },
  { name: "Playwright", href: "https://playwright.dev", Logo: PlaywrightLogo },
  { name: "Storybook", href: "https://storybook.js.org", Logo: StorybookLogo },
]

/**
 * Quiet strip of the tools this config is built on — monochrome marks,
 * each linking to the project it belongs to.
 */
export function FoundationsStrip() {
  return (
    <section aria-label="Foundations this config builds on" className="hp-foundations">
      <div className="hp-container">
        <p className="hp-foundations-lead">Built on</p>
        <ul className="hp-foundations-list">
          {FOUNDATIONS.map(({ name, href, Logo }) => (
            <li key={name}>
              <a className="hp-foundation" href={href} rel="noreferrer" target="_blank">
                <Logo size={18} />
                <span>{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
