/**
 * Consumer-install smoke check.
 *
 * Packs the built package with npm, installs the tarball into an empty
 * consumer directory together with the peers `eslint` and `typescript` (pinned
 * to the versions this workspace resolves), and lints a plain Markdown file
 * with the consumer's own ESLint. This guards against runtime dependencies
 * that are only resolvable inside the pnpm workspace, such as the undeclared
 * `tslib` import of `eslint-mdx`.
 *
 * The check fails unless ESLint reports exactly one result for `notes.md`,
 * without fatal messages and without a "File ignored" warning. Ordinary rule
 * findings do not fail it.
 */
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import {
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const packageJsonUrl = new URL(
  "../packages/eslint-config/package.json",
  import.meta.url,
)
const packageDirectory = path.dirname(fileURLToPath(packageJsonUrl))
const npmCache = path.join(tmpdir(), "eslint-config-setup-npm-cache")
const childTimeoutMs = 5 * 60 * 1000
const expectedConfigCount = 16
const buildHint = "run pnpm run build && pnpm run generate first"

const notesMarkdown = `# Release notes

This file is a plain Markdown document without code blocks.

It only exists so that the consumer smoke check can lint Markdown.
`

const eslintConfigSource = `import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ node: true })
`

const runnerSource = `import { writeFile } from "node:fs/promises"
import { ESLint } from "eslint"

const eslint = new ESLint({ cwd: process.cwd() })
const results = await eslint.lintFiles(["notes.md"])

await writeFile(
  "lint-result.json",
  JSON.stringify({
    eslintPath: import.meta.resolve("eslint"),
    eslintVersion: ESLint.version,
    results: results.map(({ filePath, messages }) => ({ filePath, messages })),
  }),
)
`

const temporaryDirectories = []

try {
  await main()
} catch (error) {
  process.stderr.write(`smoke:consumer failed: ${error.message}\n`)
  process.exitCode = 1
} finally {
  await Promise.all(
    temporaryDirectories.map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  )
}

async function main() {
  await assertBuildOutput()

  const peers = resolveWorkspacePeers()
  log(`Peers: eslint@${peers.eslint}, typescript@${peers.typescript}`)

  const packDirectory = await createTemporaryDirectory("pack")
  const consumerDirectory = await createTemporaryDirectory("consumer")
  const userConfig = path.join(packDirectory, "empty-npmrc")
  await writeFile(userConfig, "")

  const npmEnvironment = createNpmEnvironment(userConfig)

  const tarball = packPackage(packDirectory, npmEnvironment)
  log(`Packed ${path.basename(tarball)}`)

  await writeFile(
    path.join(consumerDirectory, "package.json"),
    `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
  )

  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      tarball,
      `eslint@${peers.eslint}`,
      `typescript@${peers.typescript}`,
    ],
    { cwd: consumerDirectory, env: npmEnvironment, stdio: "inherit" },
  )

  await writeFile(path.join(consumerDirectory, "eslint.config.js"), eslintConfigSource)
  await writeFile(path.join(consumerDirectory, "notes.md"), notesMarkdown)
  await writeFile(path.join(consumerDirectory, "lint-notes.mjs"), runnerSource)

  run("node", ["lint-notes.mjs"], {
    cwd: consumerDirectory,
    env: process.env,
    stdio: ["ignore", "inherit", "pipe"],
  })

  const outcome = JSON.parse(
    await readFile(path.join(consumerDirectory, "lint-result.json"), "utf8"),
  )

  assertLintOutcome(outcome, consumerDirectory, peers)
}

async function assertBuildOutput() {
  const entrypoint = path.join(packageDirectory, "dist", "index.js")
  const configsDirectory = path.join(packageDirectory, "dist", "configs")

  if (!existsSync(entrypoint) || !existsSync(configsDirectory)) {
    throw new Error(`packages/eslint-config/dist is incomplete; ${buildHint}`)
  }

  const configCount = (await readdir(configsDirectory)).filter((file) =>
    file.endsWith(".js"),
  ).length

  if (configCount !== expectedConfigCount) {
    throw new Error(
      `expected ${expectedConfigCount} generated configs in dist/configs, found ${configCount}; ${buildHint}`,
    )
  }
}

function resolveWorkspacePeers() {
  const workspaceRequire = createRequire(packageJsonUrl)

  return {
    eslint: readPackageVersion(workspaceRequire, "eslint"),
    typescript: readPackageVersion(workspaceRequire, "typescript"),
  }
}

function readPackageVersion(workspaceRequire, name) {
  let version

  try {
    version = workspaceRequire(`${name}/package.json`).version
  } catch (error) {
    throw new Error(
      `cannot resolve ${name} from packages/eslint-config: ${error.message}`,
    )
  }

  if (typeof version !== "string" || version.length === 0) {
    throw new Error(`cannot read the ${name} version from packages/eslint-config`)
  }

  return version
}

async function createTemporaryDirectory(label) {
  const directory = await realpath(
    await mkdtemp(path.join(tmpdir(), `eslint-config-setup-${label}-`)),
  )
  temporaryDirectories.push(directory)
  return directory
}

/**
 * Builds the npm child environment: inherited `npm_config_*` variables (for
 * example those injected by `pnpm run`) are dropped, the user config points to
 * an empty file, and the shared smoke-check cache is reused.
 */
function createNpmEnvironment(userConfig) {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.toLowerCase().startsWith("npm_config_"),
    ),
  )

  return {
    ...environment,
    npm_config_cache: npmCache,
    npm_config_userconfig: userConfig,
  }
}

function packPackage(packDirectory, environment) {
  const pack = run(
    "npm",
    ["pack", "--json", "--ignore-scripts", "--pack-destination", packDirectory],
    { cwd: packageDirectory, env: environment, stdio: ["ignore", "pipe", "pipe"] },
  )
  const [payload] = JSON.parse(pack.stdout)
  const tarball = path.join(packDirectory, payload.filename)

  if (!existsSync(tarball)) {
    throw new Error(`npm pack did not produce ${tarball}`)
  }

  return tarball
}

function run(command, args, options) {
  const label = `${command} ${args.join(" ")}`
  const result = spawnSync(command, args, {
    ...options,
    encoding: "utf8",
    timeout: childTimeoutMs,
  })

  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`)
  }

  if (result.status !== 0) {
    if (result.stderr) {
      process.stderr.write(result.stderr)
    }

    throw new Error(
      `${label} exited with ${result.status ?? `signal ${result.signal}`}`,
    )
  }

  return result
}

function assertLintOutcome(outcome, consumerDirectory, peers) {
  const expectedFile = path.join(consumerDirectory, "notes.md")
  const eslintPath = fileURLToPath(outcome.eslintPath)

  if (!eslintPath.startsWith(`${consumerDirectory}${path.sep}`)) {
    throw new Error(`ESLint was not loaded from the consumer install: ${eslintPath}`)
  }

  if (outcome.eslintVersion !== peers.eslint) {
    throw new Error(
      `expected consumer ESLint ${peers.eslint}, found ${outcome.eslintVersion}`,
    )
  }

  const { results } = outcome

  if (results.length !== 1 || results[0].filePath !== expectedFile) {
    throw new Error(
      `expected exactly one lint result for notes.md, found ${JSON.stringify(results.map((result) => result.filePath))}`,
    )
  }

  const { messages } = results[0]
  const fatal = messages.filter((message) => message.fatal === true)
  const ignored = messages.filter((message) =>
    message.message.includes("File ignored"),
  )

  for (const message of messages) {
    const kind = message.fatal ? "fatal" : (message.ruleId ?? "message")
    log(`notes.md:${message.line ?? 0}:${message.column ?? 0} ${kind}: ${message.message}`)
  }

  if (fatal.length > 0 || ignored.length > 0) {
    throw new Error(
      `notes.md has ${fatal.length} fatal message(s) and ${ignored.length} "File ignored" warning(s)`,
    )
  }

  log(
    `Linted notes.md with consumer ESLint ${outcome.eslintVersion}: no fatal messages (${messages.length} rule finding(s))`,
  )
}

function log(message) {
  process.stdout.write(`[smoke:consumer] ${message}\n`)
}
