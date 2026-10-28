---
title: "ADR-0025: Runtime spellcheck options in getEslintConfig"
---

ADR-0025: Runtime spellcheck options in getEslintConfig

Status: Accepted
Date: 2026-10-28
Extends: ADR-0001, ADR-0013, ADR-0021

## Context

The spell checker (ADR-0013) is always on, with the English dictionary and no way to change it through `getEslintConfig()` options (only via rule helpers such as `configureRule`/`disableRule`, a trailing override block, or a project cspell config). Non-English codebases are flooded with reports, and the rule dominates lint time (issue #101).

Configs are pre-generated for every combination of boolean flags, and the loader maps the flags to a filename through a bitmask (ADR-0001, ADR-0003). That model does not fit spell checking:

- the settings are open-ended (language, dictionaries, words, imports) and cannot be enumerated at build time
- adding a boolean bit, only to allow an opt-out, would double the permutations from 16 to 32
- the settings do not change which plugins or rules are present, only the options of one rule

## Decision

`getEslintConfig()` accepts `spellcheck?: boolean | SpellcheckOptions` and applies it as a small post-processing step on the loaded config array. The bitmask, hashes, generated files, and OxLint configs stay unchanged. Build-time functions take `ConfigFlags`, which is `ConfigOptions` without `spellcheck`, so `composeConfig({ spellcheck: false })` is a type error. `getOxlintConfig` does not accept the option.

This is an exception to "everything is resolved at build time". It is limited to this option:

- The rule is found by its key, `@cspell/spellchecker`, on every block that carries it. The generated module merges all rules into the `eslint-config-setup/base` block, so no block name can be relied on. A codegen test guards the lookup.
- `undefined` or `true` returns the loaded config unchanged.
- `false` removes only the rule key. The `@cspell` plugin stays registered, so existing disable comments become "unused directive" warnings instead of "rule not found" errors, and `addRule` can re-enable the rule.
- An object is merged into the loaded entry. Severity and base options are read from the entry, not hard-coded. Only provided (not `undefined`) fields are applied, and arrays are copied.
- The transform never mutates its input. It returns a new array with new blocks for the affected entries.
- A top-level guard accepts `undefined`, `true`, `false`, or a plain object. Anything else throws a `TypeError` that names `spellcheck` without echoing the value. Field-level types are left to the rule schema.
- If the option is `false` or an object and no block carries the rule, the loader throws a descriptive error. The transform runs after the loader's load `try`/`catch`, so this is not reported as a load failure.
- Loader error messages print `spellcheck` booleans as they are and the object form as `"<configured>"`, so configured words or paths never end up in logs.

## Consequences

- Teams can add a language, dictionaries, or words, or switch spell checking off, without leaving the public API
- The 16 pre-built permutations, hashes, and snapshot tests stay as they are
- The "no runtime composition" claim now reads: rules are pre-resolved, and `spellcheck` options are applied at load time
- A later `configureRule` on the rule replaces its options entirely, including the settings from `spellcheck`
- A project cspell config is merged on top by the plugin, and its `language` replaces `spellcheck.language`
- Further runtime options need their own decision. This ADR does not open the loader to general post-processing
- `checkIdentifiers` stays on by default. The runtime cost is documented rather than changed
