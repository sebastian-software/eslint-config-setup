import eslint from "@eslint/js"

import { createConfig } from "../build/config-builder"
import type { FlatConfigArray } from "../types"

/**
 * Base ESLint config — extends `eslint.configs.recommended` with additional
 * best-practice rules for error prevention and modern JS style.
 *
 * Rules with TypeScript equivalents (no-implied-eval, dot-notation, etc.)
 * are NOT included here — they are handled by the typescript-eslint presets.
 *
 * Preset: @eslint/js recommended
 * @see https://eslint.org/docs/latest/rules/
 */
export function baseConfig(): FlatConfigArray {
  return createConfig({
    name: "@effective/eslint/base",
    presets: [eslint.configs.recommended],
  })
    // ── Error prevention ──────────────────────────────────────────

    // Enforce getter/setter pairs — prevents incomplete property accessors
    // https://eslint.org/docs/latest/rules/accessor-pairs
    .addRule("accessor-pairs", ["error", { enforceForClassMembers: true }])

    // Require return in array method callbacks — prevents silent bugs in .map/.filter
    // https://eslint.org/docs/latest/rules/array-callback-return
    .addRule("array-callback-return", ["error", { allowImplicit: true }])

    // Disallow returning values from constructors — constructors should not return
    // https://eslint.org/docs/latest/rules/no-constructor-return
    .addRule("no-constructor-return", "error")

    // Disallow returning values from Promise executors — use resolve/reject instead
    // https://eslint.org/docs/latest/rules/no-promise-executor-return
    .addRule("no-promise-executor-return", "error")

    // Disallow self-comparison (x === x) — always a bug, use Number.isNaN instead
    // https://eslint.org/docs/latest/rules/no-self-compare
    .addRule("no-self-compare", "error")

    // Detect template literal syntax in regular strings — likely a forgotten backtick
    // https://eslint.org/docs/latest/rules/no-template-curly-in-string
    .addRule("no-template-curly-in-string", "error")

    // Detect loops that can only iterate once — logic error indicator
    // https://eslint.org/docs/latest/rules/no-unreachable-loop
    .addRule("no-unreachable-loop", "error")

    // Detect race conditions with shared variables in async code
    // https://eslint.org/docs/latest/rules/require-atomic-updates
    .addRule("require-atomic-updates", "error")

    // Detect loop conditions that are never modified — likely a bug
    // https://eslint.org/docs/latest/rules/no-unmodified-loop-condition
    .addRule("no-unmodified-loop-condition", "error")

    // Detect dead stores — variable is written but never read
    // https://eslint.org/docs/latest/rules/no-useless-assignment
    .addRule("no-useless-assignment", "error")

    // Keep getter/setter pairs adjacent — easier to find related logic
    // https://eslint.org/docs/latest/rules/grouped-accessor-pairs
    .addRule("grouped-accessor-pairs", ["error", "getBeforeSet"])

    // Remove pointless renames — `import { x as x }` is always wrong
    // https://eslint.org/docs/latest/rules/no-useless-rename
    .addRule("no-useless-rename", "error")

    // Remove unnecessary computed keys — `{ ["key"]: value }` → `{ key: value }`
    // https://eslint.org/docs/latest/rules/no-useless-computed-key
    .addRule("no-useless-computed-key", "error")

    // Prevent catch blocks from swallowing errors silently
    // https://eslint.org/docs/latest/rules/preserve-caught-error
    .addRule("preserve-caught-error", "error")

    // ── Dangerous patterns ────────────────────────────────────────

    // Forbid eval() — code injection risk, never safe
    // https://eslint.org/docs/latest/rules/no-eval
    .addRule("no-eval", "error")

    // Forbid alert/confirm/prompt — not for production code
    // https://eslint.org/docs/latest/rules/no-alert
    .addRule("no-alert", "error")

    // Forbid arguments.caller and arguments.callee — deprecated, breaks optimizations
    // https://eslint.org/docs/latest/rules/no-caller
    .addRule("no-caller", "error")

    // Forbid extending native prototypes — breaks other code
    // https://eslint.org/docs/latest/rules/no-extend-native
    .addRule("no-extend-native", "error")

    // Forbid new Function() — eval in disguise
    // https://eslint.org/docs/latest/rules/no-new-func
    .addRule("no-new-func", "error")

    // Forbid new String/Number/Boolean — use primitives
    // https://eslint.org/docs/latest/rules/no-new-wrappers
    .addRule("no-new-wrappers", "error")

    // Forbid new Object() — use {} literal instead
    // https://eslint.org/docs/latest/rules/no-object-constructor
    .addRule("no-object-constructor", "error")

    // Forbid __proto__ — use Object.getPrototypeOf instead
    // https://eslint.org/docs/latest/rules/no-proto
    .addRule("no-proto", "error")

    // Forbid __iterator__ — use Symbol.iterator instead
    // https://eslint.org/docs/latest/rules/no-iterator
    .addRule("no-iterator", "error")

    // Forbid javascript: URLs — XSS vector
    // https://eslint.org/docs/latest/rules/no-script-url
    .addRule("no-script-url", "error")

    // Forbid octal escape sequences — use unicode escapes instead
    // https://eslint.org/docs/latest/rules/no-octal-escape
    .addRule("no-octal-escape", "error")

    // ── Code quality ──────────────────────────────────────────────

    // Require strict equality, but allow == null (checks both null and undefined)
    // https://eslint.org/docs/latest/rules/eqeqeq
    .addRule("eqeqeq", ["error", "smart"])

    // Require hasOwnProperty check in for-in — prevents prototype chain iteration
    // https://eslint.org/docs/latest/rules/guard-for-in
    .addRule("guard-for-in", "error")

    // Require default case to be last in switch — consistent structure
    // https://eslint.org/docs/latest/rules/default-case-last
    .addRule("default-case-last", "error")

    // Require radix parameter in parseInt — prevents octal interpretation
    // https://eslint.org/docs/latest/rules/radix
    .addRule("radix", "error")

    // Forbid Yoda conditions (if ("red" === color)) — unnatural to read
    // https://eslint.org/docs/latest/rules/yoda
    .addRule("yoda", "error")

    // Forbid comma operator — confusing, usually a mistake
    // https://eslint.org/docs/latest/rules/no-sequences
    .addRule("no-sequences", "error")

    // Forbid new for side effects — use function call instead
    // https://eslint.org/docs/latest/rules/no-new
    .addRule("no-new", "error")

    // Forbid labels (except in rare loop cases) — goto-like control flow
    // https://eslint.org/docs/latest/rules/no-labels
    .addRule("no-labels", "error")

    // Remove unnecessary .bind() calls — no effect without this
    // https://eslint.org/docs/latest/rules/no-extra-bind
    .addRule("no-extra-bind", "error")

    // Remove unnecessary block statements — confusing nesting
    // https://eslint.org/docs/latest/rules/no-lone-blocks
    .addRule("no-lone-blocks", "error")

    // Remove unnecessary .call()/.apply() — just call the function
    // https://eslint.org/docs/latest/rules/no-useless-call
    .addRule("no-useless-call", "error")

    // Remove unnecessary string concatenation — "a" + "b" → "ab"
    // https://eslint.org/docs/latest/rules/no-useless-concat
    .addRule("no-useless-concat", "error")

    // Remove unnecessary return statements — let function end naturally
    // https://eslint.org/docs/latest/rules/no-useless-return
    .addRule("no-useless-return", "error")

    // Forbid multiline strings via backslash — use template literals
    // https://eslint.org/docs/latest/rules/no-multi-str
    .addRule("no-multi-str", "error")

    // Prefer /regex/ over new RegExp("regex") for static patterns
    // https://eslint.org/docs/latest/rules/prefer-regex-literals
    .addRule("prefer-regex-literals", [
      "error",
      { disallowRedundantWrapping: true },
    ])

    // ── Modern JS style ───────────────────────────────────────────

    // Disallow var — use let/const for block scoping
    // https://eslint.org/docs/latest/rules/no-var
    .addRule("no-var", "error")

    // Prefer const for variables never reassigned — only when ALL destructured vars are const
    // https://eslint.org/docs/latest/rules/prefer-const
    .addRule("prefer-const", ["error", { destructuring: "all" }])

    // Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call()
    // https://eslint.org/docs/latest/rules/prefer-object-has-own
    .addRule("prefer-object-has-own", "error")

    // Prefer { ...obj } over Object.assign({}, obj) — more readable
    // https://eslint.org/docs/latest/rules/prefer-object-spread
    .addRule("prefer-object-spread", "error")

    // Prefer rest parameters over `arguments` object — typed and array-like
    // https://eslint.org/docs/latest/rules/prefer-rest-params
    .addRule("prefer-rest-params", "error")

    // Prefer spread syntax over Function.prototype.apply() — cleaner syntax
    // https://eslint.org/docs/latest/rules/prefer-spread
    .addRule("prefer-spread", "error")

    // Prefer template literals over string concatenation — more readable
    // https://eslint.org/docs/latest/rules/prefer-template
    .addRule("prefer-template", "error")

    // Require description for Symbol() — aids debugging
    // https://eslint.org/docs/latest/rules/symbol-description
    .addRule("symbol-description", "error")

    .build()
}
