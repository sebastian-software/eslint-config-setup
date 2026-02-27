import type { FlatConfigArray } from "../types.ts"

/**
 * Security config — Node.js security patterns from eslint-plugin-security.
 * We manually select rules instead of using the preset because the preset
 * enables `detect-object-injection` which produces too many false positives.
 *
 * @see https://github.com/eslint-community/eslint-plugin-security#rules
 */
export function securityConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/security",
      plugins: {
        get security() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-security")
        },
      },
      rules: {
        // ── Errors: dangerous patterns that should never appear ────────

        // Detect Buffer read/write without noAssert — can read out of bounds
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-buffer-noassert.md
        "security/detect-buffer-noassert": "error",

        // Detect child_process usage — potential command injection vector
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-child-process.md
        "security/detect-child-process": "error",

        // Detect disabled mustache escaping — XSS risk in templates
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-disable-mustache-escape.md
        "security/detect-disable-mustache-escape": "error",

        // Detect eval() with variable arguments — code injection risk
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-eval-with-expression.md
        "security/detect-eval-with-expression": "error",

        // Detect new Buffer(n) — deprecated, use Buffer.alloc() instead
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-new-buffer.md
        "security/detect-new-buffer": "error",

        // Detect CSRF middleware placed after method-override — CSRF bypass
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-no-csrf-before-method-override.md
        "security/detect-no-csrf-before-method-override": "error",

        // Detect Math.random() / pseudoRandomBytes — not cryptographically secure
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-pseudoRandomBytes.md
        "security/detect-pseudoRandomBytes": "error",

        // Detect regexes vulnerable to ReDoS (catastrophic backtracking)
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-unsafe-regex.md
        "security/detect-unsafe-regex": "error",

        // ── Warnings: worth reviewing but may have legitimate uses ─────

        // Detect dynamic fs paths — potential path traversal (many false positives)
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-non-literal-fs-filename.md
        "security/detect-non-literal-fs-filename": "warn",

        // Detect dynamic regex construction — potential ReDoS
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-non-literal-regexp.md
        "security/detect-non-literal-regexp": "warn",

        // Detect dynamic require() — potential code injection
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-non-literal-require.md
        "security/detect-non-literal-require": "warn",

        // Detect string comparisons that may leak timing info — side-channel risk
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-possible-timing-attacks.md
        "security/detect-possible-timing-attacks": "warn",

        // ── Disabled: too many false positives ────────────────────────

        // Flags all bracket notation (obj[key]) — nearly every codebase triggers this
        // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-object-injection.md
        "security/detect-object-injection": "off",
      },
    },
  ]
}
