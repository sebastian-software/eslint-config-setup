import { describe, expect, it } from "vitest";

import type { ConfigOptions, FlatConfigArray } from "../types";

import { composeConfig } from "../build/compose";

/**
 * Extracts a stable, snapshotable representation of a config.
 * Strips functions/plugins (which aren't serializable) and keeps
 * the structure: block names, file patterns, and rule values.
 */
function extractSnapshot(config: FlatConfigArray) {
  return config
    .filter(
      (block) =>
        block.name != null || block.rules != null || block.files != null,
    )
    .map((block) => ({
      name: block.name ?? "(unnamed)",
      ...(block.files != null ? { files: block.files } : {}),
      ...(block.language != null ? { language: block.language } : {}),
      ...(block.rules != null ? { rules: sortRules(block.rules) } : {}),
    }));
}

function sortRules(rules: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(rules).sort()) {
    sorted[key] = rules[key];
  }
  return sorted;
}

// Key permutations that cover all meaningful combinations
const SNAPSHOT_PERMUTATIONS: Array<{ label: string; opts: ConfigOptions }> = [
  { label: "base (no flags)", opts: {} },
  { label: "react only", opts: { react: true } },
  { label: "node only", opts: { node: true } },
  { label: "ai only", opts: { ai: true } },
  { label: "react + node", opts: { react: true, node: true } },
  { label: "react + ai", opts: { react: true, ai: true } },
  { label: "react + oxlint", opts: { react: true, oxlint: true } },
  {
    label: "all flags",
    opts: { react: true, node: true, ai: true, oxlint: true },
  },
];

describe("config snapshots", () => {
  for (const { label, opts } of SNAPSHOT_PERMUTATIONS) {
    it(`snapshot: ${label}`, () => {
      const config = composeConfig(opts);
      const snapshot = extractSnapshot(config);
      expect(snapshot).toMatchSnapshot();
    });
  }
});

describe("config rule stability", () => {
  it("base config always includes eslint:recommended core rules", () => {
    const config = composeConfig({});
    const baseBlock = config.find((b) => b.name === "eslint-config-setup/base");
    expect(baseBlock?.rules).toBeDefined();
    expect(baseBlock!.rules!.eqeqeq).toStrictEqual(["error", "smart"]);
    expect(baseBlock!.rules!["no-var"]).toBe("error");
    expect(baseBlock!.rules!["prefer-const"]).toStrictEqual([
      "error",
      { destructuring: "all" },
    ]);
  });

  it("typescript config always includes type-checked rules", () => {
    const config = composeConfig({});
    const tsBlock = config.find(
      (b) => b.name === "eslint-config-setup/typescript",
    );
    expect(tsBlock?.rules).toBeDefined();
    expect(
      tsBlock!.rules!["@typescript-eslint/consistent-type-imports"],
    ).toBeDefined();
    expect(
      tsBlock!.rules!["@typescript-eslint/consistent-type-exports"],
    ).toBeDefined();
  });

  it("always uses strictTypeChecked rules", () => {
    const config = composeConfig({});
    const tsBlock = config.find(
      (b) => b.name === "eslint-config-setup/typescript",
    );
    // strictTypeChecked includes no-non-null-assertion (not in recommended)
    expect(tsBlock?.rules?.["@typescript-eslint/no-non-null-assertion"]).toBe(
      "error",
    );
  });

  it("unicorn config includes core modern-JS rules", () => {
    const config = composeConfig({});
    const unicornBlock = config.find(
      (b) => b.name === "eslint-config-setup/unicorn",
    );
    expect(unicornBlock?.rules).toBeDefined();
    expect(unicornBlock!.rules!["unicorn/prefer-array-flat-map"]).toBe("error");
    expect(unicornBlock!.rules!["unicorn/prefer-structured-clone"]).toBe(
      "error",
    );
    expect(unicornBlock!.rules!["unicorn/no-useless-spread"]).toBe("error");
  });

  it("sonarjs config includes quality rules", () => {
    const config = composeConfig({});
    const sonarBlock = config.find(
      (b) => b.name === "eslint-config-setup/sonarjs",
    );
    expect(sonarBlock?.rules).toBeDefined();
    expect(sonarBlock!.rules!["sonarjs/no-identical-functions"]).toBe("error");
    expect(sonarBlock!.rules!["sonarjs/no-collapsible-if"]).toBe("error");
  });

  it("react config includes hooks, dom, and a11y rules", () => {
    const config = composeConfig({ react: true });
    const reactBlock = config.find(
      (b) => b.name === "eslint-config-setup/react",
    );
    expect(reactBlock?.rules).toBeDefined();
    expect(reactBlock!.rules!["react-hooks/rules-of-hooks"]).toBe("error");
    expect(reactBlock!.rules!["react-hooks/exhaustive-deps"]).toBe("error");
    expect(reactBlock!.rules!["react/no-unknown-property"]).toBe("error");
    expect(reactBlock!.rules!["jsx-a11y/alt-text"]).toBe("error");
    expect(reactBlock!.rules!["jsx-a11y/anchor-is-valid"]).toBe("error");
  });

  it("react base config uses the softer migration policy and official compiler baseline", () => {
    const config = composeConfig({ react: true });
    const reactBlock = config.find(
      (b) => b.name === "eslint-config-setup/react",
    );

    expect(reactBlock?.rules).toBeDefined();
    expect(reactBlock!.rules!["react/no-context-provider"]).toBe("warn");
    expect(reactBlock!.rules!["react/no-forward-ref"]).toBe("warn");
    expect(reactBlock!.rules!["react/no-use-context"]).toBe("warn");
    expect(reactBlock!.rules!["react/jsx-no-script-url"]).toBe("error");
    expect(reactBlock!.rules!["react/jsx-no-iife"]).toBe("warn");
    expect(reactBlock!.rules!["react-hooks/exhaustive-deps"]).toBe("error");
    expect(reactBlock!.rules!["react-hooks/static-components"]).toBe("error");
    expect(reactBlock!.rules!["react-hooks/incompatible-library"]).toBe("warn");
    expect(reactBlock!.rules!["react-hooks/unsupported-syntax"]).toBe("warn");
    expect(reactBlock!.rules!["react/prefer-read-only-props"]).toBeUndefined();
  });

  it("react AI mode only adds React overrides when react is enabled", () => {
    const aiOnly = composeConfig({ ai: true });
    expect(
      aiOnly.find((b) => b.name === "eslint-config-setup/ai-react"),
    ).toBeUndefined();

    const reactAi = composeConfig({ react: true, ai: true });
    const reactAiBlock = reactAi.find(
      (b) => b.name === "eslint-config-setup/ai-react",
    );

    expect(reactAiBlock?.rules).toBeDefined();
    expect(reactAiBlock!.rules!["react/no-context-provider"]).toBe("error");
    expect(reactAiBlock!.rules!["react/no-danger"]).toBe("error");
    expect(reactAiBlock!.rules!["react/context-name"]).toBe("error");
    expect(reactAiBlock!.rules!["react/prefer-read-only-props"]).toBe("error");
    expect(reactAiBlock!.rules!["react-hooks/incompatible-library"]).toBe(
      "error",
    );
    expect(reactAiBlock!.rules!["react-hooks/unsupported-syntax"]).toBe(
      "error",
    );
    expect(reactAiBlock!.rules!["react-hooks/void-use-memo"]).toBe("error");
  });

  it("security config includes critical rules", () => {
    const config = composeConfig({});
    const secBlock = config.find(
      (b) => b.name === "eslint-config-setup/security",
    );
    expect(secBlock?.rules).toBeDefined();
    expect(secBlock!.rules!["security/detect-eval-with-expression"]).toBe(
      "error",
    );
    expect(secBlock!.rules!["security/detect-unsafe-regex"]).toBe("error");
  });

  it("json config targets .json files with correct language", () => {
    const config = composeConfig({});
    const jsonBlock = config.find((b) => b.name === "eslint-config-setup/json");
    expect(jsonBlock?.files).toStrictEqual(["**/*.json"]);
    expect(jsonBlock?.language).toBe("json/json");

    const jsoncBlock = config.find(
      (b) => b.name === "eslint-config-setup/jsonc",
    );
    expect(jsoncBlock?.language).toBe("json/jsonc");
  });

  it("markdown/mdx config targets .md and .mdx files", () => {
    const config = composeConfig({});
    const mdBlock = config.find(
      (b) => Array.isArray(b.files) && b.files.includes("**/*.{md,mdx}"),
    );
    expect(mdBlock).toBeDefined();
    expect(mdBlock?.files).toStrictEqual(["**/*.{md,mdx}"]);
  });
});

describe("config block counts per permutation", () => {
  it("base config has a stable number of blocks", () => {
    const config = composeConfig({});
    expect(config.length).toMatchSnapshot();
  });

  it("react adds additional blocks", () => {
    const base = composeConfig({});
    const withReact = composeConfig({ react: true });
    expect(withReact.length).toBeGreaterThan(base.length);
  });

  it("AI mode adds additional blocks", () => {
    const base = composeConfig({});
    const withAi = composeConfig({ ai: true });
    expect(withAi.length).toBeGreaterThan(base.length);
  });

  it("oxlint adds blocks at the end", () => {
    const base = composeConfig({});
    const withOx = composeConfig({ oxlint: true });
    expect(withOx.length).toBeGreaterThan(base.length);
  });

  it("all flags together has the most blocks", () => {
    const all = composeConfig({
      react: true,
      node: true,
      ai: true,
      oxlint: true,
    });
    const base = composeConfig({});
    expect(all.length).toBeGreaterThan(base.length + 10);
  });
});
