import { spawnSync } from "node:child_process"
import { tmpdir } from "node:os"
import path from "node:path"

const packageDirectory = new URL("../packages/eslint-config/", import.meta.url)
const npmCache = path.join(tmpdir(), "eslint-config-setup-npm-cache")

const pack = spawnSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: packageDirectory,
  encoding: "utf8",
  env: {
    ...process.env,
    npm_config_cache: npmCache,
  },
})

if (pack.status !== 0) {
  process.stderr.write(pack.stderr)
  process.exit(pack.status ?? 1)
}

const [payload] = JSON.parse(pack.stdout)
const files = payload.files.map((file) => file.path)

assertIncludes(files, "dist/index.js")
assertIncludes(files, "dist/modules.js")
assertFileCount(files, /^dist\/configs\/.+\.js$/, 16)
assertFileCount(files, /^dist\/oxlint-configs\/.+\.json$/, 8)

const entrypoint = new URL("dist/index.js", packageDirectory)
const { getEslintConfig, getOxlintConfig } = await import(
  entrypoint.href
)

const eslintConfig = await getEslintConfig({
  react: true,
  ai: true,
  oxlint: true,
})

if (!Array.isArray(eslintConfig) || eslintConfig.length === 0) {
  throw new Error("Expected getEslintConfig() to return a non-empty config array")
}

const oxlintConfig = getOxlintConfig({
  react: true,
  ai: true,
})

if (typeof oxlintConfig !== "object" || oxlintConfig === null) {
  throw new Error("Expected getOxlintConfig() to return a config object")
}

function assertIncludes(files, expected) {
  if (!files.includes(expected)) {
    throw new Error(`Package payload is missing ${expected}`)
  }
}

function assertFileCount(files, pattern, expectedCount) {
  const count = files.filter((file) => pattern.test(file)).length

  if (count !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} package files matching ${pattern}, found ${count}`,
    )
  }
}
