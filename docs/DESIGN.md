# Docs Site — Design System Notes

Visual decisions for the homepage (`docs/app/homepage.css`, `hp-` namespace)
and the shared Ardo shell.

## Aesthetic

Precision / engineering-spec. The design material is the product's own
artifacts: real rule counts, real SHA-1 hashes, real filenames, a real
ESLint/OxLint split. Structure comes from hairline borders and mono numerals.

**Hard bans** (do not reintroduce):

- Gradient text, glow gradients, decorative blurs
- Uppercase kicker/eyebrow labels above headings
- Grids of identical cards
- Side-stripe borders (colored left borders on panels)
- Border + large shadow "ghost card" combos
- Border radius above 16px on containers

## Color

Monochrome OKLCH ramp + one accent: deep signal green, hue **155**
("CI is green" semantics; no direct competitor owns green).

- `--ardo-hue-brand: 155` and `--ardo-hue-neutral: 155` are set globally in
  `homepage.css`, so the Ardo doc shell recolors with the same hue. Ardo's own
  light/dark values then flow into the homepage tokens.
- `--hp-accent: var(--ardo-color-brand, oklch(0.52 0.14 155))` — literal
  fallback in case the Ardo token contract changes.
- `--hp-accent-ink` is a darker/lighter variant tuned for text at >= 4.5:1
  contrast (light: `oklch(0.43 0.11 155)`, dark: `oklch(0.78 0.12 155)`).
- The neutral ramp (`--hp-bg`, `--hp-surface`, `--hp-line`, `--hp-ink`,
  `--hp-ink-muted`, `--hp-ink-faint`) is aliased to Ardo's bg/border/text
  tokens so the homepage and shell never drift; dark mode comes for free via
  Ardo's `.dark` class on the root element.
- `--hp-accent-deep` (light: `oklch(0.37 0.115 155)`, dark: `oklch(0.33 0.1 155)`)
  is the full-drench surface. It is used exactly once: the closing section
  inverts onto it by re-declaring the scoped `--hp-*` tokens (see
  `.hp-closing`). One drenched moment per page — don't add more.
- Text selection (`::selection`) uses the accent as background; part of the
  "green = decided" commitment.

## Typography

Self-hosted via Fontsource, imported in `root.tsx` **before** `homepage.css`.
No Google Fonts `@import`.

- **Schibsted Grotesk** (variable) — display and UI (`--hp-font-display`,
  also `--ardo-font-family`).
- **Fragment Mono** — hashes, rule counts, readouts, section indices
  (`--hp-font-mono`). No bold weight exists; never bold it.
- **JetBrains Mono** (variable) — code blocks (`--hp-font-code`, also
  `--ardo-font-mono`).

## Motion

Restraint: "spec sheet, not launch video."

- Rich motion only inside the configurator, all state-driven: rule-count
  crossfade keyed on `stats.hash` (300ms), split-bar width (300ms,
  `cubic-bezier(0.2, 0, 0, 1)`), hash fade (150ms). No timers.
- Entry animation: a single fade-up on the hero title. No staggers.
- A `prefers-reduced-motion` block flattens all animation/transition durations;
  `aria-live` on the readout remains the semantic channel.

## Layout devices

- Numbered section heads: hairline top border + Fragment Mono index (01–06).
- Receipts as a linked ledger (rows), not stat cards.
- Asymmetric grids (5/7, 7/5) instead of symmetric card grids.
