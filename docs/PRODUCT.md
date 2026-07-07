# Docs Site — Product Context

Context for design/copy sessions on the documentation site (`docs/`), especially
the homepage.

## Register

**Brand.** The homepage is a marketing surface, not documentation. It argues a
position and closes with an install. Doc pages (guide, ADRs, API) stay in the
neutral documentation register.

## Positioning

> It's just ESLint. Resolved ahead of time. Accelerated by Rust.

Three objections, one line each:

1. **"Another wrapper?"** — No. It's plain ESLint; the output configs are plain
   ES modules you can open and read.
2. **"Configs are fragile compositions."** — Not here. All 16 flag permutations
   are composed, hashed, and tested before publishing. Users select, they don't
   assemble.
3. **"ESLint is slow."** — The `oxlint` flag moves every OxLint-capable rule to
   Rust automatically; ESLint keeps type-aware rules and the long tail.

Determinism leads; the AI mode is the second act ("Rules humans find tedious.
The AI doesn't mind.").

## Voice rules

- No exclamation marks.
- No eyebrow kickers above headings.
- Exact numbers ("16,603", never "16k+"). Numbers on the homepage should come
  from `docs/app/generated/config-stats.json` (via `getPermutation`) wherever
  possible so they cannot drift from the package.
- "It's just ESLint" and "The AI doesn't mind" appear once each.
- Proof over claims: every stat in the Receipts section links to the artifact
  behind it (tests, snapshot, ADRs, CI matrix).
- The pratfall is deliberate: "This is v0.5 and it is opinionated" — admitting
  the constraint is part of the pitch.

## Data pipeline

`docs/scripts/generate-config-stats.ts` (run via the `data` script before
`dev`/`build`) imports the package's own composition logic from
`packages/eslint-config/src` and writes per-permutation stats (rule counts,
hashes, filenames, OxLint split) to `docs/app/generated/config-stats.json`.
The JSON is committed; drift shows up in PR diffs. No timestamps — output must
be byte-stable for prerender determinism.
