import unicornPlugin from "eslint-plugin-unicorn"

import type { FlatConfigArray } from "../types"

/**
 * Unicorn config — modern JavaScript idioms and best practices.
 * We hand-pick rules instead of using `flat/recommended` because the
 * recommended preset includes opinionated rules we disagree with
 * (e.g., `no-null`, `no-nested-ternary`, `filename-case`).
 *
 * @see https://github.com/sindresorhus/eslint-plugin-unicorn#rules
 */
export function unicornConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/unicorn",
      plugins: {
        unicorn: unicornPlugin,
      },
      rules: {
        // ── Error prevention ──────────────────────────────────────────

        // Forbid `/* eslint-disable */` without specific rule — too broad
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-abusive-eslint-disable.md
        "unicorn/no-abusive-eslint-disable": "error",

        // Use Array.isArray() instead of instanceof Array — works across realms
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-instanceof-array.md
        "unicorn/no-instanceof-array": "error",

        // Prevent passing non-function to removeEventListener — common mistake
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-invalid-remove-event-listener.md
        "unicorn/no-invalid-remove-event-listener": "error",

        // Prefer direct undefined checks over typeof — cleaner with strict mode
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-typeof-undefined.md
        "unicorn/no-typeof-undefined": "error",

        // Remove useless fallback in object spread ({ ...a, x: a.x ?? y })
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-fallback-in-spread.md
        "unicorn/no-useless-fallback-in-spread": "error",

        // Remove unnecessary .length checks before array operations
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-length-check.md
        "unicorn/no-useless-length-check": "error",

        // Remove unnecessary spread operators ([...array] when array already exists)
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-spread.md
        "unicorn/no-useless-spread": "error",

        // Remove useless Promise.resolve/reject wrappers — simplify async code
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-promise-resolve-reject.md
        "unicorn/no-useless-promise-resolve-reject": "error",

        // Disallow `return undefined` — implicit undefined is cleaner
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-undefined.md
        "unicorn/no-useless-undefined": "error",

        // Require Error messages — aids debugging
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/error-message.md
        "unicorn/error-message": "error",

        // Require `new` keyword when throwing errors — consistent pattern
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/throw-new-error.md
        "unicorn/throw-new-error": "error",

        // ── Modern API preferences ────────────────────────────────────

        // Prefer .flatMap() over .map().flat() — single pass, more readable
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-flat-map.md
        "unicorn/prefer-array-flat-map": "error",

        // Prefer .find() over .filter()[0] — stops at first match
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-find.md
        "unicorn/prefer-array-find": "error",

        // Prefer .flat() over manual recursive flattening
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-flat.md
        "unicorn/prefer-array-flat": "error",

        // Prefer .indexOf() over manual search loops
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-index-of.md
        "unicorn/prefer-array-index-of": "error",

        // Prefer .some() over .find() !== undefined — semantic intent
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-some.md
        "unicorn/prefer-array-some": "error",

        // Prefer .at(-1) over arr[arr.length - 1] — cleaner negative indexing
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-at.md
        "unicorn/prefer-at": "error",

        // Prefer .includes() over .indexOf() !== -1 — boolean intent
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-includes.md
        "unicorn/prefer-includes": "error",

        // Prefer .before()/.after()/.replaceWith() over parent.insertBefore()
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-modern-dom-apis.md
        "unicorn/prefer-modern-dom-apis": "error",

        // Prefer Math.log10/Math.hypot over manual math — accurate and readable
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-modern-math-apis.md
        "unicorn/prefer-modern-math-apis": "error",

        // Prefer negative index over length-based — cleaner with .slice(-n)
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-negative-index.md
        "unicorn/prefer-negative-index": "error",

        // Prefer Number.isFinite/Number.isNaN over global — no coercion
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-number-properties.md
        "unicorn/prefer-number-properties": "error",

        // Prefer Object.fromEntries() over manual reduce for key-value mapping
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-object-from-entries.md
        "unicorn/prefer-object-from-entries": "error",

        // Prefer Set.has() over Array.includes() for repeated lookups — O(1)
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-set-has.md
        "unicorn/prefer-set-has": "error",

        // Prefer .replaceAll() over regex with global flag — clearer intent
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-replace-all.md
        "unicorn/prefer-string-replace-all": "error",

        // Prefer .slice() over .substr()/.substring() — consistent, no gotchas
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-slice.md
        "unicorn/prefer-string-slice": "error",

        // Prefer .startsWith()/.endsWith() over regex — simpler, faster
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-starts-ends-with.md
        "unicorn/prefer-string-starts-ends-with": "error",

        // Prefer .trimStart()/.trimEnd() over .trimLeft()/.trimRight()
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-trim-start-end.md
        "unicorn/prefer-string-trim-start-end": "error",

        // Prefer structuredClone() over JSON.parse(JSON.stringify()) — handles more types
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-structured-clone.md
        "unicorn/prefer-structured-clone": "error",

        // Prefer top-level await over async IIFE — cleaner module pattern
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-top-level-await.md
        "unicorn/prefer-top-level-await": "error",

        // Throw TypeError for type checks — correct error type
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-type-error.md
        "unicorn/prefer-type-error": "error",

        // ── Regex ─────────────────────────────────────────────────────

        // Simplify regex patterns — auto-fixable regex optimization
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/better-regex.md
        "unicorn/better-regex": "error",

        // ── Misc ──────────────────────────────────────────────────────

        // Enforce `error` name in catch blocks — consistent naming
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/catch-error-name.md
        "unicorn/catch-error-name": ["error", { name: "error" }],

        // Enforce `new` for builtins that require it (Map, Set, WeakMap, etc.)
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/new-for-builtins.md
        "unicorn/new-for-builtins": "error",

        // Prefer Array.from({length}) or fill() over new Array(n) — explicit intent
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-new-array.md
        "unicorn/no-new-array": "error",

        // Prefer Buffer.from()/Buffer.alloc() over new Buffer() — deprecated
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-new-buffer.md
        "unicorn/no-new-buffer": "error",

        // Forbid unreadable destructuring like `const [,,, d] = arr`
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-unreadable-array-destructuring.md
        "unicorn/no-unreadable-array-destructuring": "error",

        // Remove unnecessary `.0` in numbers (1.0 → 1) — cleaner
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-zero-fractions.md
        "unicorn/no-zero-fractions": "error",

        // Enforce lowercase hex (0xff not 0xFF) — consistent
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/number-literal-case.md
        "unicorn/number-literal-case": "error",

        // Enforce numeric separators (1_000_000 not 1000000) — readable large numbers
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/numeric-separators-style.md
        "unicorn/numeric-separators-style": "error",

        // Prefer `export { x } from 'y'` over import then re-export
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-export-from.md
        "unicorn/prefer-export-from": ["error", { ignoreUsedVariables: true }],

        // Prefer built-in coercion (String, Number, Boolean) over wrapper functions
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-native-coercion-functions.md
        "unicorn/prefer-native-coercion-functions": "error",

        // Prefer .test() over .match() for boolean regex checks
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-regexp-test.md
        "unicorn/prefer-regexp-test": "error",

        // Prefer [...iterable] spread over Array.from(iterable) — concise
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-spread.md
        "unicorn/prefer-spread": "error",

        // Prefer relative URLs over absolute same-origin URLs
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/relative-url-style.md
        "unicorn/relative-url-style": "error",
      },
    },
  ]
}
