import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { allPermutations, bitmaskToHash, optionsToBitmask } from "../hash.ts"
import type { ConfigOptions } from "../types.ts"
import { composeConfig } from "./compose.ts"
import { serializeConfig } from "./serialize.ts"

const dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(dirname, "../../dist/configs")

function describeOptions(opts: ConfigOptions): string {
  const flags = Object.entries(opts)
    .filter(([, v]) => v)
    .map(([k]) => k)
  return flags.length > 0 ? flags.join(" + ") : "base"
}

function main(): void {
  mkdirSync(outDir, { recursive: true })

  let count = 0

  for (const opts of allPermutations()) {
    const mask = optionsToBitmask(opts)
    const hash = bitmaskToHash(mask)
    const filename = `${hash}.js`
    const filepath = path.join(outDir, filename)

    const config = composeConfig(opts)
    const content = serializeConfig(config)

    writeFileSync(filepath, content, "utf-8")
    count++

    const desc = describeOptions(opts)
    const size = (Buffer.byteLength(content) / 1024).toFixed(1)
    console.log(`  [${String(mask).padStart(2, " ")}] ${hash}.js → ${desc} (${size} KB)`)
  }

  console.log(`\nGenerated ${count} config permutations in dist/configs/`)
}

main()
