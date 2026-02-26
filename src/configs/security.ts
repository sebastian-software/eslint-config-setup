import type { FlatConfigArray } from "../types.ts"

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
        "security/detect-buffer-noassert": "error",
        "security/detect-child-process": "error",
        "security/detect-disable-mustache-escape": "error",
        "security/detect-eval-with-expression": "error",
        "security/detect-new-buffer": "error",
        "security/detect-no-csrf-before-method-override": "error",
        "security/detect-non-literal-fs-filename": "warn",
        "security/detect-non-literal-regexp": "warn",
        "security/detect-non-literal-require": "warn",
        "security/detect-object-injection": "off",
        "security/detect-possible-timing-attacks": "warn",
        "security/detect-pseudoRandomBytes": "error",
        "security/detect-unsafe-regex": "error",
      },
    },
  ]
}
