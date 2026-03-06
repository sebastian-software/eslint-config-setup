---
title: "ADR-0021: React Rule Policy after Compat Refactor"
---

ADR-0021: React Rule Policy after Compat Refactor

Status: Accepted
Date: 2026-03-06
Extends: ADR-0006, ADR-0019, ADR-0020

## Context

After ADR-0019 and ADR-0020, the remaining open question was no longer plugin selection but **rule policy**: which React rules should be enabled, at which severity, and where `base` and `ai: true` should intentionally diverge.

This policy was reviewed rule-by-rule against the current published comparison set on March 6, 2026:

- `eslint-config-xo-react@0.29.0`
- `@antfu/eslint-config@7.7.0`
- `ultracite@7.2.5`

The review also incorporates the React team’s current direction:

- React Compiler is a stable, first-class part of the modern React toolchain
- `eslint-plugin-react-hooks` now carries the official compiler-powered rules
- React 19 migration guidance (`no-context-provider`, `no-forward-ref`, `no-use-context`) is treated as legitimate forward-looking linting, not as an experimental side path

The comparison produced three recurring tensions:

1. **Modern React vs legacy React plugin conventions.** XO and Ultracite still derive many opinions from `eslint-plugin-react`, but several of those rules either do not exist in `@eslint-react` or encode older assumptions.
2. **Base pragmatism vs AI strictness.** Some rules are useful guardrails for AI-generated code while still being too noisy for a general-purpose base config.
3. **Generic config vs framework-aware exceptions.** Rules like Fast Refresh and parts of `jsx-a11y` can be correct in principle, but become brittle without framework- or component-aware overrides.

## Decision

Adopt a **two-tier React rule policy**:

- `base` stays pragmatic, modern, and low-noise
- `ai: true` is allowed to enforce additional consistency and migration pressure when the false-positive risk is low

We follow four principles:

1. Prefer **official React direction** over legacy plugin tradition where the two disagree
2. Prefer **modern `@eslint-react` / `react-hooks` rules** over reintroducing `eslint-plugin-react` for isolated tail rules
3. Use `ai: true` for **consistency rules that help generators**, not for framework-specific guesswork
4. Keep component-system-sensitive rules off until they can be made **DOM- or file-pattern-aware**

## Accepted Policy

### React 19 migration rules

Rules:

- `react/no-context-provider`
- `react/no-forward-ref`
- `react/no-use-context`

Policy:

- `base`: `warn`
- `ai: true`: `error`

Why:

- Pros: aligns with React’s forward direction; good fit for generated code; nudges new code away from patterns React is actively moving past
- Cons: not all codebases migrate at the same pace; too aggressive for a generic base config

### Core correctness and bug-prevention rules

Rules:

- `react/no-prop-types`
- `react/no-array-index-key`
- `react-hooks/exhaustive-deps`
- `react/no-implicit-key`
- `react/jsx-no-comment-textnodes`

Policy:

- `base`: `error`
- `ai: true`: `error`

Why:

- Pros: these catch real defects or costly React footguns; comparison configs are already strict here or clearly trend in that direction
- Cons: `exhaustive-deps` can be noisy during migrations, but the net bug-prevention value is high enough to justify `error`

### DOM/XSS rules

Rules:

- `react/no-danger`
- `react/jsx-no-script-url`
- `react/no-unsafe-iframe-sandbox`

Policy:

- `base`: `warn`, `error`, `warn`
- `ai: true`: `error`, `error`, `error`

Why:

- Pros: `javascript:` URLs are almost always wrong and deserve `error`; AI-generated code should not get a pass on dangerous DOM patterns
- Cons: `dangerouslySetInnerHTML` and iframe sandbox choices can be legitimate in reviewed code, so base remains softer

### Web API leak detection

Rules:

- `react/no-leaked-event-listener`
- `react/no-leaked-interval`
- `react/no-leaked-timeout`
- `react/no-leaked-resize-observer`

Policy:

- `base`: `error`
- `ai: true`: `error`

Why:

- Pros: distinctive strength of the modern stack; catches cleanup bugs that older React configs miss entirely
- Cons: limited ecosystem precedent, but the rule set is targeted enough to justify staying strict

### Children API discouragement

Rules:

- `react/no-children-count`
- `react/no-children-for-each`
- `react/no-children-map`
- `react/no-children-only`
- `react/no-children-to-array`
- `react/no-clone-element`

Policy:

- `base`: `warn`
- `ai: true`: `error`

Why:

- Pros: encourages composition over brittle Children utilities; useful for generated code that tends to overuse escape-hatch APIs
- Cons: these are architecture guidance, not direct bug finders, so base should not make them build-breaking

### Fast Refresh / HMR

Rule:

- `react-refresh/only-export-components`

Policy:

- `base`: `warn`
- `ai: true`: `warn`

Why:

- Pros: catches invalid export shapes and protects hot reload ergonomics
- Cons: global `allowExportNames` lists are framework-specific and unattractive in a generic config; file-based overrides are a better long-term design than a universal allowlist

Follow-up:

- If framework-specific presets are added later, prefer **file-pattern-specific overrides** over global `allowExportNames`

### Naming conventions

Rules:

- `react/context-name`
- `react/ref-name`
- `react/hook-use-state`

Policy:

- `base`: `warn`
- `ai: true`: `error`

Why:

- Pros: low ambiguity, high consistency value, especially for generated code; same rationale as strict type-style policies elsewhere in the config
- Cons: mostly stylistic for humans; not worth red builds in the default profile

### Deprecated and legacy API rules

Rules:

- `react/no-create-ref`
- `react/no-default-props`
- `react/no-string-refs`
- `react/no-component-will-mount`
- `react/no-component-will-receive-props`
- `react/no-component-will-update`

Policy:

- `base`: `error`
- `ai: true`: `error`

Why:

- Pros: these are clear migration and maintenance wins, not taste-based style rules
- Cons: can increase churn in old codebases, but modern shared config defaults should not normalize these APIs

### `UNSAFE_` lifecycles and `setState` in lifecycles

Rules:

- `react/no-unsafe-component-will-mount`
- `react/no-unsafe-component-will-receive-props`
- `react/no-unsafe-component-will-update`
- `react/no-set-state-in-component-did-mount`
- `react/no-set-state-in-component-did-update`
- `react/no-set-state-in-component-will-update`

Policy:

- `base`: `warn`
- `ai: true`: `error`

Why:

- Pros: good “smell” detection; AI code should not casually introduce these patterns
- Cons: migration-heavy codebases sometimes need staged cleanup; `warn` is more practical in base

### Class components

Rule:

- `react/no-class-component`

Policy:

- `base`: `error`
- `ai: true`: `error`

Why:

- Pros: keeps the config aligned with modern React; discourages reintroduction of legacy component style
- Cons: would be too strict if Error Boundaries required disabling the rule entirely

Important nuance:

- This policy is acceptable because `@eslint-react/no-class-component` keeps Error Boundaries as a valid exception

### Unused React members

Rules:

- `react/no-unused-state`
- `react/no-unused-props`

Policy:

- `base`: `error`, `warn`
- `ai: true`: `error`, `warn`

Why:

- Pros: `no-unused-state` is a strong bug/dead-code rule; `no-unused-props` is helpful but more migration-sensitive
- Cons: pushing `no-unused-props` to `error` would create more churn than value for shared-config consumers

### Optimization and render hygiene hints

Rules:

- `react/no-useless-forward-ref`
- `react/prefer-use-state-lazy-initialization`
- `react/no-unnecessary-use-prefix`
- `react/no-unnecessary-use-callback`
- `react/no-unnecessary-use-memo`
- `react/destructuring-assignment`
- `react/jsx-key-before-spread`

Policy:

- `base`: `warn`
- `ai: true`: `warn`

Why:

- Pros: useful nudges and code-review accelerators
- Cons: too opinionated to become build blockers, even in AI mode

Special case:

- `react/jsx-no-iife` should be softer than the strongest bug rules and is accepted as `warn`

### Accessibility policy

Keep enabled:

- `jsx-a11y/no-autofocus`: `error`
- `jsx-a11y/label-has-associated-control`: `error`

Keep disabled for now:

- `jsx-a11y/control-has-associated-label`
- `jsx-a11y/iframe-has-title`
- `jsx-a11y/interactive-supports-focus`
- `jsx-a11y/media-has-caption`
- `jsx-a11y/no-static-element-interactions`
- `jsx-a11y/no-noninteractive-element-interactions`
- `jsx-a11y/no-noninteractive-tabindex`
- `jsx-a11y/no-aria-hidden-on-focusable`
- `jsx-a11y/anchor-ambiguous-text`

Policy:

- `base`: current targeted a11y subset only
- `ai: true`: same as base

Why:

- Pros: keeps high-signal a11y checks on
- Cons: many deeper `jsx-a11y` rules become noisy when abstractions are expressed through design-system components instead of raw DOM; they need component-aware configuration, not blanket activation

### React Compiler rules

Rules:

- official compiler-powered `react-hooks` rule set

Policy:

- `base`: adopt the official `eslint-plugin-react-hooks` recommended compiler profile
- `ai: true`: adopt `recommended-latest` and escalate the remaining compiler warnings to `error`

Why:

- Pros: follows the official React line instead of inventing a custom stance; compiler rules now belong to mainstream React quality, not an experimental edge path
- Cons: stronger assumptions about modern React tooling; may increase pressure on older projects

### AI-only readonly props

Rule:

- `react/prefer-read-only-props`

Policy:

- `base`: `off`
- `ai: true`: `error`

Why:

- Pros: strong consistency value for generated TypeScript; similar in spirit to choosing one canonical type style
- Cons: can create broad churn in hand-written existing code; not strong enough for the default profile

### Intentionally off: legacy-plugin tail rules

Keep off:

- `react/checked-requires-onchange-or-readonly`
- `react/no-unescaped-entities`
- `react/no-invalid-html-attribute`

Why:

- Pros: avoids reintroducing `eslint-plugin-react` solely to recover a handful of legacy-only rules
- Cons: gives up a few useful checks that the legacy plugin still models well

Decision:

- do not bring back `eslint-plugin-react` just for these tail rules

### Intentionally off: strongly opinionated legacy conventions

Keep off:

- `react/boolean-prop-naming`
- `react/function-component-definition`
- `react/require-default-props`

Why:

- Pros: avoids enforcing legacy-plugin-only taste rules that do not exist natively in the modern stack
- Cons: gives up some consistency benefits, especially for AI-generated code

Decision:

- leave them off for now
- revisit only if a modern-stack-native equivalent or a clearly isolated optional add-on emerges

## Consequences

- The React profile is now explicitly split into a **pragmatic base** and a **stricter AI policy**
- Official React guidance, especially around compiler rules, becomes the preferred source of truth over older ecosystem convention
- Modern React strengths stay central: React 19 migration, Web API leak detection, and compiler-aware Hooks analysis
- Framework-specific exceptions are treated as **override design problems**, not reasons for global allowlists
- Some accepted decisions may be documented before every corresponding config change lands; this ADR is normative for the next React rule pass

