import { describe, expect, it } from "vitest"

import { composeConfig } from "../build/compose"

describe("composeConfig", () => {
  it("returns a non-empty array for base options", () => {
    const config = composeConfig({})
    expect(config.length).toBeGreaterThan(0)
  })

  it("every custom config block has a name property", () => {
    const config = composeConfig({ react: true, node: true, ai: true })
    for (const block of config) {
      // Our blocks are named; third-party blocks (typescript-eslint, regexp, etc.) have their own names
      if (block.name?.startsWith("@effective/")) {
        expect(block.name).toMatch(/^@effective\/eslint\//)
      }
    }
  })

  it("includes react blocks only when react is true", () => {
    const withReact = composeConfig({ react: true })
    const withoutReact = composeConfig({})

    const reactBlocks = withReact.filter((b) => b.name?.includes("react"))
    const noReactBlocks = withoutReact.filter((b) => b.name?.includes("react"))

    expect(reactBlocks.length).toBeGreaterThan(0)
    expect(noReactBlocks.length).toBe(0)
  })

  it("includes node blocks only when node is true", () => {
    const withNode = composeConfig({ node: true })
    const withoutNode = composeConfig({})

    const nodeBlocks = withNode.filter((b) => b.name?.includes("node"))
    const noNodeBlocks = withoutNode.filter((b) => b.name?.includes("node"))

    expect(nodeBlocks.length).toBeGreaterThan(0)
    expect(noNodeBlocks.length).toBe(0)
  })

  it("includes AI blocks only when ai is true", () => {
    const withAi = composeConfig({ ai: true })
    const withoutAi = composeConfig({})

    const aiBlocks = withAi.filter((b) => b.name?.includes("ai"))
    const noAiBlocks = withoutAi.filter((b) => b.name?.includes("ai"))

    expect(aiBlocks.length).toBeGreaterThan(0)
    expect(noAiBlocks.length).toBe(0)
  })

  it("includes storybook override only when react is true", () => {
    const withReact = composeConfig({ react: true })
    const withoutReact = composeConfig({})

    const storyBlocks = withReact.filter((b) => b.name?.includes("stories"))
    const noStoryBlocks = withoutReact.filter((b) => b.name?.includes("stories"))

    expect(storyBlocks.length).toBeGreaterThan(0)
    expect(noStoryBlocks.length).toBe(0)
  })

  it("always ends with prettier as the last TS/JS config", () => {
    const config = composeConfig({ react: true, node: true })
    // Find the last block that is NOT json/markdown/oxlint related
    const tsJsBlocks = config.filter(
      (b) =>
        !b.name?.includes("json") &&
        !b.name?.includes("markdown") &&
        !b.name?.includes("oxlint"),
    )
    const last = tsJsBlocks[tsJsBlocks.length - 1]
    expect(last.name).toBe("@effective/eslint/prettier")
  })

  it("places oxlint configs at the very end when enabled", () => {
    const config = composeConfig({ react: true, oxlint: true })
    const lastBlock = config[config.length - 1]
    expect(lastBlock.name).toMatch(/oxlint/)
  })

  it("AI mode sets its own complexity limits", () => {
    const aiConfig = composeConfig({ ai: true })

    const aiComplexity = aiConfig.find(
      (b) => b.name === "@effective/eslint/ai-complexity",
    )

    expect(aiComplexity?.rules?.complexity).toEqual(["error", 10])
  })

  it("includes testing-library rules only when react is true", () => {
    const withReact = composeConfig({ react: true })
    const withoutReact = composeConfig({})

    const reactTestBlocks = withReact.filter((b) =>
      b.name?.includes("tests-react"),
    )
    const noReactTestBlocks = withoutReact.filter((b) =>
      b.name?.includes("tests-react"),
    )

    expect(reactTestBlocks.length).toBeGreaterThan(0)
    expect(noReactTestBlocks.length).toBe(0)
  })
})
