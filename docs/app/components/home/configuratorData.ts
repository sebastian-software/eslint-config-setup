/**
 * Static metadata for the homepage flag configurator and shared homepage
 * constants. Kept out of the components so copy lives in one place and the
 * component files stay within lint budgets.
 */
import type { FlagState } from "../../lib/configStats"

export type FlagMeta = {
  description: string
  id: keyof FlagState
  label: string
}

/** Order matches the package's option object and bitmask (react, node, ai, oxlint). */
export const FLAG_METADATA: FlagMeta[] = [
  {
    id: "react",
    label: "React",
    description: "JSX, hooks, a11y, and the compat layer",
  },
  {
    id: "node",
    label: "Node",
    description: "Runtime rules for server-side code",
  },
  {
    id: "ai",
    label: "AI guardrails",
    description: "Stricter budgets for generated code",
  },
  {
    id: "oxlint",
    label: "OxLint",
    description: "Move compatible rules to Rust",
  },
]

export const INSTALL_COMMAND = "npm install -D eslint-config-setup"

export const REPO_URL = "https://github.com/sebastian-software/eslint-config-setup"

export const GETTING_STARTED_PATH = "/guide/getting-started"

/** The exact two-line config a user writes for the selected flags. */
export function buildConfigSnippet(flags: FlagState): string {
  const activeFlags = FLAG_METADATA.map((meta) => meta.id).filter((id) => flags[id])
  const options =
    activeFlags.length > 0
      ? `{ ${activeFlags.map((id) => `${id}: true`).join(", ")} }`
      : ""
  return [
    'import { getEslintConfig } from "eslint-config-setup"',
    "",
    `export default await getEslintConfig(${options})`,
  ].join("\n")
}
