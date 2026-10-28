# Load only the import resolvers in generated configs

**Plan status:** Implemented
**Source:** effective-flow plan
**Recommended workflow:** Bugfix (`effective-flow fix`)

## Requirement

PR #106 (merged as `efb42e1`) added `settings` to the generated configs. To build `import-x/resolver-next`, every generated config now runs `import { createImportXResolvers } from "eslint-config-setup/modules"`. That causes a performance regression.

**The problem.** `dist/modules.js` re-exports `composeConfig` and every config factory (`packages/eslint-config/src/modules.ts:20-56`). Loading it evaluates the top-level imports of every plugin: the React stack, `eslint-plugin-oxlint`, `@cspell/eslint-plugin`, `sonarjs`, `security`, `unicorn`, playwright, storybook, vitest, testing-library and more. This happens whatever options the config was generated for. It undoes the per-permutation import trimming in `buildImports` (`src/build/codegen.ts:536`), slows every ESLint start, and contradicts the "No startup cost" claim in `docs/app/routes/guide/architecture.mdx:9`. This is finding N1 from the PR #106 review.

**Goal.** A generated config loads only what its permutation needs, plus one small resolver entry. In detail:

- **N1:** generated configs import the resolvers from a dedicated subpath that contains nothing but `createImportXResolvers()`.
- **N2:** the 16-permutation e2e test actually exercises the resolvers, with a positive signal. Today the fixture `FIXTURE_TS` has no imports, so its `Resolve error` check passes vacuously.
- **N3:** the built artifacts are verified. Every `dist/configs/*.js` loads, carries the expected resolver chain and imports nothing from this package except the new entry. The new entry pulls in nothing beyond the two resolver packages.
- **N4:** `deepMergeSettings` handles `undefined` source values and the `__proto__` key safely, and its doc comment states exactly where it differs from ESLint's flat-config `deepMerge`.
- **N5:** a composed block with `basePath` counts as scoped, not global, so its settings fail the build instead of silently applying to every file.

**Why Bugfix:** the change corrects a regression in runtime behavior (startup cost) and two correctness gaps in the settings collection. The one addition, the `./import-resolvers` subpath, exists only to fix that regression.

**Release:** ship as a `fix:` commit, which means a patch release. The changelog body describes `eslint-config-setup/import-resolvers` as an internally used but supported entry.

## Architecture decisions

- **Dedicated subpath `eslint-config-setup/import-resolvers`.** This is a new tsdown entry and a new `package.json` `exports` entry pointing at a module built from `src/configs/import-resolvers.ts` only. Generated configs import `createImportXResolvers` from there. `eslint-config-setup/modules` keeps re-exporting `createImportXResolvers` for power users, so that existing public API stays unchanged.
  - *Rationale:* the resolver options keep a single source, as decided for #100, and generated configs stop loading the full module graph.
  - *Rejected alternatives:* emitting `createTypeScriptImportResolver()` and `createNodeResolver()` directly would reintroduce the risk that the two copies of the resolver options drift apart. Exporting from the main `eslint-config-setup` entry would mix internals into the public API and load the loader as well.
- **The subpath is a supported but minimal entry.** Its only exports are `createImportXResolvers` and the type `ImportXResolver` (`src/configs/import-resolvers.ts:5`), which appears in `dist/import-resolvers.d.ts`. It is not advertised in the user guide beyond one sentence in the architecture/modular-imports docs. It is covered by the smoke check like the other entries.
- **Verification of built artifacts happens in the package smoke check.** CI runs unit and e2e tests before `build` (`.github/workflows/ci.yml`, test job), which is why the e2e harness uses a source stub. The `package-smoke` job runs after build and generate, so assertions on the real `dist/` belong there (`scripts/check-package-smoke.mjs`).
- **N6 is not a change item.** The e2e stub relies on Node's TypeScript type stripping (unflagged from Node 22.18). The repository's development `engines` already require `>=22.22` (root `package.json:23`), and the CI matrix resolves `22` to the latest 22.x. The published package's `engines` (`>=22.13`) concern consumers, who never run the tests.

## Affected files

| File | Description |
|---|---|
| `packages/eslint-config/tsdown.config.ts` | Add an `import-resolvers` entry pointing at `src/configs/import-resolvers.ts`. |
| `packages/eslint-config/package.json` | Add `exports["./import-resolvers"]` with `types` and `import`, matching the existing `./modules` shape. |
| `packages/eslint-config/src/build/plugin-registry.ts` | Point the `settingExpressions["import-x/resolver-next"]` import at `eslint-config-setup/import-resolvers`, and update the doc comment (around lines 205-213). |
| `packages/eslint-config/src/configs/import-resolvers.ts` | Update the comment that names the import specifier (line 15). No behavior change. |
| `packages/eslint-config/src/build/codegen.ts` | N4: `deepMergeSettings` (around lines 423-432) skips `undefined` source values and the `__proto__` key, and `isJsonSerializable` rejects an own `__proto__` key at any depth. N5: in `isGlobalBlock` only (around lines 409-414) add `basePath === undefined`. `hasNonJsFields` (282-287) stays unchanged, because rule collection uses it as well (line 262). Change the scoped-settings error text (line 352) to list `basePath`, and update the `collectBaseSettings` and `deepMergeSettings` doc comments. |
| `packages/eslint-config/src/__tests__/codegen.test.ts` | Update the import-string assertion (around lines 254-255). Add unit tests for N4 and N5. |
| `packages/eslint-config/src/__tests__/eslint-e2e.test.ts` | The stub (`writeModulesStub`, around lines 113-139) serves `./import-resolvers`; keep `./modules` only if still referenced. The 16-permutation test gets a positive resolution fixture (see step 3). |
| `scripts/check-package-smoke.mjs` | Pack-list, built-config and specifier checks against the real `dist/` (see step 4). |
| `docs/app/routes/adr/0002-codegen.md` | Line 20: update the import specifier, state why a dedicated entry is used, and add `basePath` to the definition of a global block. |
| `docs/app/routes/guide/modular-imports.mdx` | One sentence: `createImportXResolvers` is also available from `eslint-config-setup/import-resolvers`. |

## Implementation details

### Approach

1. **New entry.** Add the tsdown entry and the `exports` entry. After `pnpm build`, `dist/import-resolvers.js` and `dist/import-resolvers.d.ts` exist. `dist/import-resolvers.js` imports only the two resolver packages, which tsdown keeps external through the existing `neverBundle` entries (`eslint-plugin-*` and `eslint-import-resolver-typescript`).
2. **Repoint codegen.** Change the import statement in `settingExpressions` to `import { createImportXResolvers } from "eslint-config-setup/import-resolvers"`. The expression stays `createImportXResolvers()`.
3. **e2e harness and a positive resolution signal.**
   - The stub package exposes `./import-resolvers` and re-exports the source helper, as it does today for `./modules`.
   - In the 16-permutation test, the fixture project gets:
     - a `package.json` without dependencies;
     - a sibling `util.ts`;
     - a `test.ts` that imports `./util`, `node:path` and `picomatch`. `picomatch` is installed in the linked `node_modules` but not declared.
   - Assert no fatal message and no `Resolve error`, as today.
   - Assert exactly one `import/no-extraneous-dependencies` message, and assert that its text names `'@types/picomatch'`.
     - Only the TypeScript resolver maps `picomatch` to its DefinitelyTyped declarations.
     - If `import-x/resolver-next` were missing, import-x would fall back to its legacy Node resolver, and the message would name `'picomatch'`. A test that accepted that message would pass without the fix.
   - Also assert that `(await eslint.calculateConfigForFile(test.ts)).settings["import-x/resolver-next"]` has the `name` values `["eslint-import-resolver-typescript", "eslint-plugin-import-x:node"]`.
   - In the same `calculateConfigForFile` result, assert that `import/no-extraneous-dependencies` is enabled. If it ever gets disabled in a permutation, for example because oxlint starts implementing it, the test fails with an explicit message saying the signal rule was disabled, not with a count mismatch.
   - `import/no-unresolved` is not enabled in any permutation, so it is not used as a signal.
   - Verified preconditions:
     - `picomatch` and `@types/picomatch` are linked into the tmp project.
     - A `package.json` without dependencies stops import-x from walking up to the repository's `package.json`.
     - The fixture name `test.ts` matches no test-override glob.
4. **Smoke check against the real `dist/`** (`scripts/check-package-smoke.mjs`):
   - Assert that `dist/import-resolvers.js` is in the pack list.
   - Import all 16 `dist/configs/*.js`. In each one's `eslint-config-setup/base` block, the `name` values of `settings["import-x/resolver-next"]` must equal `["eslint-import-resolver-typescript", "eslint-plugin-import-x:node"]`.
   - Read every `dist/configs/*.js` and `dist/import-resolvers.js` as text. Strip `//#` source-map comments, then extract every import specifier: `import … from`, `export … from`, side-effect `import "…"` and dynamic `import("…")`, in single or double quotes. A regex of the form `/(?:^|[\s;])(?:import|export)\b[^'"]*?\bfrom\s*["']([^"']+)["']|\bimport\s*\(?\s*["']([^"']+)["']/gm` is sufficient.
     - The only `eslint-config-setup*` specifier allowed is `eslint-config-setup/import-resolvers`.
     - No specifier may be relative.
   - The specifier set of `dist/import-resolvers.js` must equal exactly `{eslint-import-resolver-typescript, eslint-plugin-import-x}`. Any `./` chunk import fails the check.
   - Import `dist/modules.js` and assert that it still exports `createImportXResolvers`.
5. **N4.**
   - In `deepMergeSettings`, skip a source entry whose value is `undefined` and skip the key `__proto__`.
     - Skipping `undefined` prevents the "not JSON-serializable" error when a later block sets a key to `undefined`. It differs from ESLint only in that the key stays absent instead of becoming `undefined`, which is equivalent at runtime.
     - A first-occurrence value is still kept by reference and is not cleaned. An `undefined` inside the first block's value (`{ a: { b: undefined } }`) therefore still fails the serializability check. ESLint behaves the same way, and this is accepted.
   - `isJsonSerializable` rejects any object with an own `__proto__` key at any depth. `emitSettings` would otherwise write `"__proto__": …` into an object literal, which sets the prototype instead of creating a key.
   - The doc comment names the two remaining differences from ESLint: only plain objects merge (class instances are rejected by the serializability check), and an absent key stays absent.
   - Tests create own `__proto__` keys with `JSON.parse('{"__proto__": …}')` or `Object.defineProperty`, never with an object literal. A literal `__proto__` sets the prototype and creates no own key, so a test built that way would pass vacuously.
   - After merging, the tests assert `Object.hasOwn(result, "__proto__") === false` and `Object.getPrototypeOf(result) === Object.prototype`.
6. **N5.**
   - Add `&& basePath === undefined` in `isGlobalBlock` only.
   - Leave `hasNonJsFields` unchanged. It also drives rule collection, and changing it would drop the rules of `basePath` blocks from the base merge.
   - The scoped-settings error at `codegen.ts:352` reads "(files, ignores, basePath, language or processor set)".
   - The `collectBaseSettings` doc comment and ADR 0002 line 20 define a global block the same way.
   - **Non-goal:** the *rules* of a `basePath` block are still merged into the global base block, because `resolveRulesForFile` and `configMatchesFile` (`codegen.ts:257-324`) ignore `basePath`. No composed block uses `basePath` today (`git grep basePath` finds nothing). A code comment at `isGlobalBlock` records this limitation.
7. **Docs.** Update ADR 0002 and the modular-imports guide. Read `architecture.mdx:9` again after the fix: the claim holds once more, so it needs no change.

### Edge cases

- **Old generated configs:** generated configs ship inside the same package version and are regenerated on every release, so no published version pairs an old `dist/configs` file with a new package. The `./modules` re-export stays, so hand-written imports keep working.
- **pnpm and other strict layouts:** the self-reference `eslint-config-setup/import-resolvers` resolves through the package's own `exports`, exactly like `./modules` does today, which already passes `smoke:package` and the self-lint job.
- **Oxlint permutations:** they still emit the settings even though `eslint-plugin-oxlint` turns `import/no-cycle` off. Loading the small entry is cheap, so no special case is needed.
- **`undefined` in a later block:** after N4 the earlier value survives. That matches ESLint, so a merged config behaves the same at runtime as it does in codegen.
- **`basePath` on a third-party block without settings:** unaffected. Only blocks that carry non-empty `settings` trigger the error.

## Acceptance criteria

- [ ] `dist/import-resolvers.js` exists after `pnpm build`, is in the `npm pack` file list, and statically imports only `eslint-import-resolver-typescript` and `eslint-plugin-import-x`. Asserted by `smoke:package`.
- [ ] All 16 generated `dist/configs/*.js` import `createImportXResolvers` from `eslint-config-setup/import-resolvers`. Their only `eslint-config-setup*` specifier is that one, and none is relative. Asserted by `codegen.test.ts` for the module source and by `smoke:package` for the built files.
- [ ] `smoke:package` imports every `dist/configs/*.js` successfully. In each base block, the resolver `name` values equal `["eslint-import-resolver-typescript", "eslint-plugin-import-x:node"]`.
- [ ] The 16-permutation e2e test lints a fixture that imports `./util`, `node:path` and the undeclared `picomatch`. Every permutation shows:
  - no fatal message and no `Resolve error`;
  - exactly one `import/no-extraneous-dependencies` message, naming `'@types/picomatch'`;
  - a `calculateConfigForFile` result whose resolver `name` values equal `["eslint-import-resolver-typescript", "eslint-plugin-import-x:node"]` and in which `import/no-extraneous-dependencies` is enabled.
- [ ] The existing cycle, natural-sort, MDX and multi-extension e2e tests stay green.
- [ ] N4: unit tests show that an `undefined` value in a later block keeps the earlier value and that a `__proto__` key is ignored. The existing merge tests stay green.
- [ ] N5: a unit test shows that a block with `basePath` and non-empty `settings` makes `collectBaseSettings` throw the scoped-settings error, and that a `basePath` block without settings does not.
- [ ] N4: a unit test shows that an own `__proto__` key nested in a settings value makes the build throw. Own `__proto__` keys in tests are created with `JSON.parse` or `Object.defineProperty`, and the merge test asserts `Object.hasOwn(result, "__proto__") === false` and an unchanged prototype.
- [ ] `eslint-config-setup/modules` still exports `createImportXResolvers`. Asserted by `smoke:package` against `dist/modules.js`.
- [ ] `pnpm check`, `pnpm test`, `pnpm build`, `pnpm generate`, `pnpm lint` and `pnpm smoke:package` pass. The 8 `dist/oxlint-configs/*.json` files are byte-identical to `main`, and `src/__tests__/__snapshots__/snapshots.test.ts.snap` is unchanged.
- [ ] ADR 0002 and the modular-imports guide name `eslint-config-setup/import-resolvers`, and ADR 0002 lists `basePath` in its definition of a global block.

## Validation plan

- Run the commands above locally in the implementation worktree, then in CI (full OS × Node matrix plus Bun).
- **Oxlint byte-identity:** `dist/` is gitignored, so there is no committed baseline. Build and generate `origin/main` in a separate worktree, then run `diff -r <main>/packages/eslint-config/dist/oxlint-configs packages/eslint-config/dist/oxlint-configs`. Empty output is required, and the PR states the result.
- **Before/after startup measurement:** time `node -e "await import('<dist>/configs/<hash for {}>.js')"` on `main` and on the branch, three runs each, on an otherwise idle machine, and state the numbers in the PR. This is evidence for the fix, not an acceptance gate, because the CI host load varies.

## Assumptions and open points

- Verified 2026-10-28 with tsdown 0.22.14 and rolldown 1.2.15:
  - The new entry is emitted together with a `.d.ts` file.
  - It imports only the two resolver packages.
  - `dist/modules.js` then re-imports `./import-resolvers.js`.
  - The self-reference from `dist/configs` resolves through the package's own `exports`.
  
  The smoke check guards all of this against future bundler changes.
- Assumption: a dedicated subpath is acceptable as additional public surface. It exports a single function that already exists under `./modules`.

## Plan review

**Result:** Approved

### Summary

| Area            | Critical | Important | Note |
| --------------- | -------: | --------: | ---: |
| Architecture    |        0 |         0 |    2 |
| Security        |        0 |         0 |    0 |
| Data protection |        0 |         0 |    0 |
| Error cases     |        0 |         1 |    2 |
| Testability     |        1 |         4 |    2 |
| Scope           |        0 |         0 |    1 |
| Maintainability |        0 |         0 |    3 |

### Findings

Automatic review:

- **Testability, Important:** the planned e2e assertions only checked for absent messages. Those cannot fail when resolution silently returns nothing, and `import/no-unresolved` is not enabled in any permutation. Incorporated: a positive signal, exactly one `import/no-extraneous-dependencies` report for an undeclared but installed package. That rule reports only after successful resolution and is enabled in all 16 permutations.
- **Testability, Important:** the planned guard against loading too many plugins already held on `main` and therefore could not catch N1. It also proposed reading a module's import list by importing the module, which doesn't work. Incorporated: a text-based specifier scan of every `dist/configs/*.js`, plus an exact-match specifier set for `dist/import-resolvers.js`, which also catches a move into a shared bundler chunk.
- **Error cases, Important:** the N5 location was left open. Changing `hasNonJsFields` would also have dropped the rules of `basePath` blocks. Incorporated: the change goes into `isGlobalBlock` only, and the error text, doc comment and ADR 0002 definition are updated.
- **Error cases, Note:** the N4 wording claimed full parity with ESLint's `deepMerge`. A nested own `__proto__` could also be emitted as a prototype setter. Incorporated: the remaining differences are stated precisely, and `isJsonSerializable` rejects own `__proto__` keys at any depth.
- **Testability, Note:** nothing proved that generated output is otherwise unchanged, one assertion location was ambiguous, and the resolver check was loose. Incorporated: the snapshot file must stay unchanged, the `modules` export is checked in the smoke script, and the resolver names are compared exactly.
- **Maintainability, Note:** the bundling assumption could be verified directly. Incorporated: it is recorded as verified, with the tool versions.

Deep interactive review (2026-10-28):

- **Testability, Critical:** the planned positive signal would also pass without the resolver setting. When `import-x/resolver-next` is missing, import-x falls back to its legacy Node resolver, which also resolves `picomatch`. Incorporated: the message must name `'@types/picomatch'`, which only the TypeScript resolver produces, and the test also checks the resolver names via `calculateConfigForFile`.
- **Testability, Important:** the specifier regex missed side-effect, dynamic and single-quoted imports. Incorporated: a broader extraction that also covers `export … from`, and strips source-map comments first.
- **Testability, Important:** `__proto__` tests written with an object literal would pass vacuously. Incorporated: own keys are built with `JSON.parse` or `defineProperty`, and the tests make explicit prototype assertions.
- **Error cases, Note:** `undefined` handling differs between merged and first-occurrence values. Decided: keep the ESLint-equivalent asymmetry and state the rationale precisely.
- **Architecture, Note:** the rules of `basePath` blocks are still merged into the global base block. Decided: recorded as an explicit non-goal with a code comment, because no composed block uses `basePath`.
- **Architecture, Note:** the entry also exports the type `ImportXResolver`. Incorporated: the public surface is named accordingly.
- **Scope, Note:** the release type was undecided. Decided: `fix:`, which means a patch release, with a changelog note on the new entry.
- **Testability, Note:** the oxlint byte-identity criterion had no baseline procedure. Incorporated: build `origin/main` in a separate worktree and diff the two outputs.
- **Maintainability, Note:** the signal rule could be disabled in the future. Incorporated: an explicit check that the rule is enabled.
- **Maintainability, Note:** the edge case about old generated configs was garbled. Incorporated: reworded.

## Open points

- No open points.
