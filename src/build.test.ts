import { describe, expect, it, vi } from "vitest"

import { getFileName } from "./build"

// getFileName calls console.log internally
vi.spyOn(console, "log").mockImplementation(() => {})

describe("getFileName", () => {
  it("returns dateUtils.ts by default", () => {
    expect(getFileName()).toBe("dateUtils.ts")
  })

  it("returns dateUtils.test.ts for test files", () => {
    expect(getFileName({ test: true })).toBe("dateUtils.test.ts")
  })

  it("returns AdminPanel.spec.ts for playwright files", () => {
    expect(getFileName({ playwright: true })).toBe("AdminPanel.spec.ts")
  })

  it("returns Button.stories.ts for storybook files", () => {
    expect(getFileName({ storybook: true })).toBe("Button.stories.ts")
  })

  it("returns .tsx extension for react files", () => {
    expect(getFileName({ react: true })).toBe("dateUtils.tsx")
  })

  it("returns .tsx for react storybook files", () => {
    expect(getFileName({ react: true, storybook: true })).toBe("Button.stories.tsx")
  })

  it("keeps .ts for react test files", () => {
    expect(getFileName({ react: true, test: true })).toBe("dateUtils.test.ts")
  })

  it("keeps .ts for react playwright files", () => {
    expect(getFileName({ react: true, playwright: true })).toBe("AdminPanel.spec.ts")
  })

  it("prefers test over playwright and storybook", () => {
    expect(getFileName({ test: true, playwright: true, storybook: true })).toBe(
      "dateUtils.test.ts"
    )
  })

  it("prefers playwright over storybook", () => {
    expect(getFileName({ playwright: true, storybook: true })).toBe("AdminPanel.spec.ts")
  })
})
