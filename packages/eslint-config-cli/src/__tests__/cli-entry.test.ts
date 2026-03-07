import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"

import { afterEach, describe, expect, it, vi } from "vitest"

import { runCli } from "../index"

function createProjectDir(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "eslint-config-setup-cli-entry-"))
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "fixture", private: true }, null, 2),
  )
  return dir
}

const originalCwd = process.cwd()
const stdinTtyDescriptor = Object.getOwnPropertyDescriptor(process.stdin, "isTTY")
const stdoutTtyDescriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY")

afterEach(() => {
  process.chdir(originalCwd)
  vi.restoreAllMocks()

  if (stdinTtyDescriptor) {
    Object.defineProperty(process.stdin, "isTTY", stdinTtyDescriptor)
  }

  if (stdoutTtyDescriptor) {
    Object.defineProperty(process.stdout, "isTTY", stdoutTtyDescriptor)
  }
})

describe("runCli", () => {
  it("prints a TTY error for interactive init in non-interactive shells", async () => {
    const dir = createProjectDir()
    process.chdir(dir)

    Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: false })
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: false })

    const error = vi.spyOn(console, "error").mockImplementation(() => {})

    const exitCode = await runCli(["init"])

    expect(exitCode).toBe(1)
    expect(error).toHaveBeenCalledWith(
      "Interactive init requires a TTY. Pass flags explicitly instead.",
    )
  })

  it("supports the non-interactive dry-run path through the CLI entry", async () => {
    const dir = createProjectDir()
    process.chdir(dir)

    const log = vi.spyOn(console, "log").mockImplementation(() => {})

    const exitCode = await runCli(["init", "--react", "--dry-run"])

    expect(exitCode).toBe(0)
    expect(log.mock.calls.flat().join("\n")).toContain("Configured project using npm.")
    expect(log.mock.calls.flat().join("\n")).toContain("File changes: update")
    expect(log.mock.calls.flat().join("\n")).toContain("Dependencies: install eslint, install eslint-config-setup, install typescript")
    expect(log.mock.calls.flat().join("\n")).toContain("Install dependencies manually: npm install -D eslint eslint-config-setup typescript")
  })

  it("surfaces overwrite conflicts from the CLI entry", async () => {
    const dir = createProjectDir()
    process.chdir(dir)
    writeFileSync(path.join(dir, "eslint.config.ts"), "export default []\n")

    await expect(runCli(["init", "--react"])).rejects.toThrow(
      /Init found existing files or scripts that would be overwritten/,
    )
  })

  it("applies force through the CLI entry", async () => {
    const dir = createProjectDir()
    process.chdir(dir)
    writeFileSync(path.join(dir, "eslint.config.ts"), "export default []\n")

    const log = vi.spyOn(console, "log").mockImplementation(() => {})

    const exitCode = await runCli(["init", "--react", "--force"])

    expect(exitCode).toBe(0)
    expect(readFileSync(path.join(dir, "eslint.config.ts"), "utf8")).toContain("getEslintConfig")
    expect(log.mock.calls.flat().join("\n")).toContain("File changes: update")
  })
})
