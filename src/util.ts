import { createHash } from "crypto"
import { Linter } from "eslint"

export interface Options {
  // mode options
  strict?: boolean

  // additional rules options
  node?: boolean
  react?: boolean

  // ai mode
  ai?: boolean
}

export const flags = [
  // mode options
  "strict",

  // additional rules options
  "node",
  "react",

  // ai mode
  "ai"
] as const

export function optionsToNumber(opts: Options): number {
  let num = 0
  for (let i = 0; i < flags.length; i++) {
    if (opts[flags[i]]) {
      num |= 1 << i
    }
  }
  return num
}

export function numberToShortHash(num: number): string {
  return createHash("sha1").update(String(num)).digest("hex").slice(0, 8)
}

export type ConfigName = "base" | "test" | "e2e" | "storybook"

export function getConfigObject(
  config: Linter.Config[],
  objectName: ConfigName = "base"
): Linter.Config {
  const obj = config.find((c) => c.name === `effective/${objectName}`)
  if (!obj) {
    throw new Error(`Config ${objectName} not found!`)
  }

  return obj
}
