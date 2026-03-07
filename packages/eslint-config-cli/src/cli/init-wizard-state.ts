import type { HookStrategy, InitOptions } from "./shared"

export interface InitWizardState {
  agents: boolean
  ai: boolean
  formatter: "none" | "oxfmt"
  hookStrategy: HookStrategy
  install: boolean
  node: boolean
  oxlint: boolean
  react: boolean
  vscode: boolean
}

export type WizardStepId =
  | "profile"
  | "formatter"
  | "editor"
  | "agents"
  | "hooks"
  | "install"
  | "review"

export interface WizardStepDefinition {
  id: WizardStepId
  question: string
}

export const WIZARD_STEPS: WizardStepDefinition[] = [
  { id: "profile", question: "Which project profile do you want to enable?" },
  { id: "formatter", question: "Which formatter should the setup use?" },
  { id: "editor", question: "Which editor setup should be generated?" },
  { id: "agents", question: "Which agent guidance should be enabled?" },
  { id: "hooks", question: "Which Git hook scaffolding should be generated?" },
  { id: "install", question: "Should dependencies be installed automatically?" },
  { id: "review", question: "Review the generated setup before writing files." },
] as const

export function createDefaultWizardState(): InitWizardState {
  return {
    agents: true,
    ai: false,
    formatter: "none",
    hookStrategy: "none",
    install: false,
    node: false,
    oxlint: false,
    react: true,
    vscode: true,
  }
}

export function getStepAnswerSummary(
  stepId: WizardStepId,
  state: InitWizardState,
): string {
  switch (stepId) {
    case "profile":
      return joinSelected([
        state.react ? "React" : null,
        state.node ? "Node.js" : null,
        state.ai ? "AI mode" : null,
        state.oxlint ? "OxLint" : null,
      ])
    case "formatter":
      return state.formatter === "oxfmt" ? "oxfmt" : "No formatter companion"
    case "editor":
      return state.vscode ? "VS Code" : "No editor files"
    case "agents":
      return state.agents ? "AGENTS.md" : "No agent guidance"
    case "hooks":
      if (state.hookStrategy === "husky") {
        return "Husky pre-commit"
      }

      return state.hookStrategy === "native" ? "Native pre-commit hook" : "No Git hooks"
    case "install":
      return state.install ? "Install dependencies now" : "Print install command only"
    case "review":
      return "Ready to write files"
  }
}

export function toInitOptions(
  cwd: string,
  state: InitWizardState,
): InitOptions {
  return {
    agents: state.agents,
    ai: state.ai,
    cwd,
    formatter: state.formatter,
    hookStrategy: state.hookStrategy,
    install: state.install,
    node: state.node,
    oxlint: state.oxlint,
    react: state.react,
    vscode: state.vscode,
  }
}

function joinSelected(values: Array<string | null>): string {
  const selected = values.filter(Boolean)
  return selected.length > 0 ? selected.join(", ") : "None"
}
