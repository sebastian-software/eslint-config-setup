import type { Linter } from "eslint"

import { getConfig } from "./src/index"

const base = await getConfig({
  node: true,
  strict: true,
  ai: true
})

const config: Linter.Config[] = [
  { ignores: ["node_modules", "dist"] },
  ...base
]

export default config
