import { describe, expect, it } from "vitest";

import { reactConfig } from "../configs/react";
import { reactCompatPlugin } from "../plugins/react-compat";

describe("reactCompatPlugin", () => {
  it("keeps semantic @eslint-react rule names when no safe legacy alias exists", () => {
    expect(reactCompatPlugin.rules).toHaveProperty("no-forward-ref");
    expect(reactCompatPlugin.rules).toHaveProperty("no-prop-types");
    expect(reactCompatPlugin.rules).not.toHaveProperty("forward-ref-uses-ref");
    expect(reactCompatPlugin.rules).not.toHaveProperty("prop-types");
  });
});

describe("reactConfig", () => {
  it("uses semantic @eslint-react rule names for React 19 and PropTypes migration", () => {
    const rules = reactConfig()[0].rules ?? {};

    expect(rules["react/no-forward-ref"]).toBe("warn");
    expect(rules["react/no-prop-types"]).toBe("error");
    expect(rules).not.toHaveProperty("react/forward-ref-uses-ref");
    expect(rules).not.toHaveProperty("react/prop-types");
  });
});
