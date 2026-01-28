import { describe, expect, it } from "vitest"

import { buildConfig } from "./generator"

describe("createConfig", () => {
  it("generates a base configuration", async () => {
    const config = await buildConfig({})
    expect(config).toMatchSnapshot()
  })

  //
  // ENABLING...
  //

  it("includes NodeJS specific rules", async () => {
    const config = await buildConfig({ node: true })
    expect(config).toMatchSnapshot()
  })

  it("includes React specific rules", async () => {
    const config = await buildConfig({ react: true })
    expect(config).toMatchSnapshot()
  })

  it("includes Test specific rules", async () => {
    const config = await buildConfig({ strict: true }, { fileName: "dateUtils.test.ts" })
    expect(config).toMatchSnapshot()
  })

  it("includes Storybook specific rules", async () => {
    const config = await buildConfig(
      { react: true, strict: true },
      { fileName: "Button.stories.tsx" }
    )
    expect(config).toMatchSnapshot()
  })

  it("includes Playwright specific rules", async () => {
    const config = await buildConfig({ strict: true }, { fileName: "AdminPanel.spec.ts" })
    expect(config).toMatchSnapshot()
  })

  //
  // GLOBAL SETTINGS...
  //

  it("enables strict rules", async () => {
    const config = await buildConfig({ strict: true })
    expect(config).toMatchSnapshot()
  })

  it("combines all options", async () => {
    const config = await buildConfig({
      node: true,
      react: true,
      strict: true
    })
    expect(config).toMatchSnapshot()
  })

  //
  // AI MODE...
  //

  it("includes AI maintainability rules", async () => {
    const config = await buildConfig({ ai: true })
    expect(config).toMatchSnapshot()
  })

  it("combines ai with react and node", async () => {
    const config = await buildConfig({ ai: true, react: true, node: true })
    expect(config).toMatchSnapshot()
  })
})
