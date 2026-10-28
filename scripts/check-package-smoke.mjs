import { spawnSync } from "node:child_process"
import { readdir, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { isDeepStrictEqual } from "node:util"

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
assertIncludes(files, "dist/import-resolvers.js")
assertIncludes(files, "dist/import-resolvers.d.ts")
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

const expectedResolverNames = [
  "eslint-import-resolver-typescript",
  "eslint-plugin-import-x:node",
]
const allowedSelfSpecifier = "eslint-config-setup/import-resolvers"
const expectedResolverEntrySpecifiers = [
  "eslint-import-resolver-typescript",
  "eslint-plugin-import-x",
]

const configsDirectory = new URL("dist/configs/", packageDirectory)
const configFiles = (await readdir(configsDirectory))
  .filter((file) => file.endsWith(".js"))
  .sort()

if (configFiles.length !== 16) {
  throw new Error(
    `Expected 16 generated configs in dist/configs, found ${configFiles.length}`,
  )
}

for (const file of configFiles) {
  const label = `dist/configs/${file}`
  const fileUrl = new URL(file, configsDirectory)
  const { default: config } = await import(fileUrl.href)

  if (!Array.isArray(config)) {
    throw new TypeError(`${label}: expected the default export to be a config array`)
  }

  const baseBlock = config.find(
    (block) => block?.name === "eslint-config-setup/base",
  )

  if (!baseBlock) {
    throw new Error(`${label}: missing the "eslint-config-setup/base" block`)
  }

  const resolvers = baseBlock.settings?.["import-x/resolver-next"]

  if (!Array.isArray(resolvers)) {
    throw new TypeError(
      `${label}: base block has no settings["import-x/resolver-next"] array`,
    )
  }

  const resolverNames = resolvers.map((resolver) => resolver?.name)

  if (!isDeepStrictEqual(resolverNames, expectedResolverNames)) {
    throw new Error(
      `${label}: expected resolver names ${JSON.stringify(expectedResolverNames)}, found ${JSON.stringify(resolverNames)}`,
    )
  }

  const specifiers = extractSpecifiers(await readFile(fileUrl, "utf8"))

  for (const specifier of specifiers) {
    if (isRelativeSpecifier(specifier)) {
      throw new Error(`${label}: relative import specifier "${specifier}" is not allowed`)
    }

    if (
      isSelfSpecifier(specifier) &&
      specifier !== allowedSelfSpecifier
    ) {
      throw new Error(
        `${label}: import specifier "${specifier}" is not allowed; the only allowed eslint-config-setup specifier is "${allowedSelfSpecifier}"`,
      )
    }
  }
}

const importResolversUrl = new URL("dist/import-resolvers.js", packageDirectory)
const importResolversSpecifiers = [
  ...new Set(extractSpecifiers(await readFile(importResolversUrl, "utf8"))),
].sort()

if (!isDeepStrictEqual(importResolversSpecifiers, expectedResolverEntrySpecifiers)) {
  throw new Error(
    `dist/import-resolvers.js: expected import specifiers ${JSON.stringify(expectedResolverEntrySpecifiers)}, found ${JSON.stringify(importResolversSpecifiers)}`,
  )
}

const modulesEntrypoint = new URL("dist/modules.js", packageDirectory)
const modules = await import(modulesEntrypoint.href)

if (typeof modules.createImportXResolvers !== "function") {
  throw new TypeError(
    "dist/modules.js: expected createImportXResolvers to be exported as a function",
  )
}

function assertIncludes(files, expected) {
  if (!files.includes(expected)) {
    throw new Error(`Package payload is missing ${expected}`)
  }
}

/**
 * Extracts every module specifier from built JS source: static
 * `import … from`, `export … from`, side-effect `import "…"` and dynamic
 * `import("…")`, in single or double quotes. `//#` source-map comment lines are
 * stripped first so they cannot contribute false matches. A bare `import` must
 * not follow an identifier, member access, quote, slash or hyphen, so string
 * contents such as `"import": plugin` or `"…/import" + suffix` are not
 * mistaken for side-effect imports, while `[import("…")]` or `=>import("…")`
 * still are. Template-literal dynamic specifiers are matched as well.
 */
function extractSpecifiers(source) {
  const code = source
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//#"))
    .join("\n")
  const pattern =
    /(?:^|[\s;])(?:import|export)\b[^'"]*?\bfrom\s*["']([^"'\r\n]+)["']|(?<![\w$.'"/`-])import\s*\(?\s*["'`]([^"'`\r\n]+)["'`]/gm

  return [...code.matchAll(pattern)].map((match) => match[1] ?? match[2])
}

function isRelativeSpecifier(specifier) {
  return (
    specifier.startsWith("./") ||
    specifier.startsWith("../") ||
    specifier.startsWith("/")
  )
}

function isSelfSpecifier(specifier) {
  return specifier.startsWith("eslint-config-setup")
}

function assertFileCount(files, pattern, expectedCount) {
  const count = files.filter((file) => pattern.test(file)).length

  if (count !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} package files matching ${pattern}, found ${count}`,
    )
  }
}
