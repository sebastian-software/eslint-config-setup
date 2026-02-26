import globals from "globals"

import type { FlatConfigArray } from "../types.ts"

export function reactConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/react",
      languageOptions: {
        globals: {
          ...globals.browser,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        get react() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-react")
        },
        get "react-hooks"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-react-hooks")
        },
        get "react-compiler"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-react-compiler")
        },
        get "jsx-a11y"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-jsx-a11y")
        },
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        // React core
        "react/jsx-no-target-blank": "error",
        "react/jsx-no-undef": "error",
        "react/jsx-uses-react": "off", // Not needed with React 17+ JSX transform
        "react/react-in-jsx-scope": "off", // Not needed with React 17+ JSX transform
        "react/no-danger": "warn",
        "react/no-deprecated": "error",
        "react/no-direct-mutation-state": "error",
        "react/no-unknown-property": "error",
        "react/no-unstable-nested-components": "error",
        "react/no-children-prop": "error",
        "react/self-closing-comp": "error",
        "react/void-dom-elements-no-children": "error",
        "react/prop-types": "off", // TypeScript handles this
        "react/jsx-key": ["error", { checkFragmentShorthand: true }],
        "react/jsx-no-comment-textnodes": "error",
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
        "react/jsx-pascal-case": "error",
        "react/jsx-boolean-value": ["error", "never"],
        "react/jsx-curly-brace-presence": [
          "error",
          { props: "never", children: "never" },
        ],
        "react/function-component-definition": [
          "error",
          {
            namedComponents: "function-declaration",
            unnamedComponents: "arrow-function",
          },
        ],
        "react/hook-use-state": "error",
        "react/iframe-missing-sandbox": "error",

        // React Hooks
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",

        // React Compiler (React 19+ / Server Components)
        "react-compiler/react-compiler": "error",

        // JSX Accessibility
        "jsx-a11y/alt-text": "error",
        "jsx-a11y/anchor-has-content": "error",
        "jsx-a11y/anchor-is-valid": "error",
        "jsx-a11y/aria-activedescendant-has-tabindex": "error",
        "jsx-a11y/aria-props": "error",
        "jsx-a11y/aria-proptypes": "error",
        "jsx-a11y/aria-role": "error",
        "jsx-a11y/aria-unsupported-elements": "error",
        "jsx-a11y/click-events-have-key-events": "error",
        "jsx-a11y/heading-has-content": "error",
        "jsx-a11y/html-has-lang": "error",
        "jsx-a11y/img-redundant-alt": "error",
        "jsx-a11y/label-has-associated-control": "error",
        "jsx-a11y/mouse-events-have-key-events": "error",
        "jsx-a11y/no-access-key": "error",
        "jsx-a11y/no-autofocus": ["error", { ignoreNonDOM: true }],
        "jsx-a11y/no-distracting-elements": "error",
        "jsx-a11y/no-redundant-roles": "error",
        "jsx-a11y/role-has-required-aria-props": "error",
        "jsx-a11y/role-supports-aria-props": "error",
        "jsx-a11y/scope": "error",
        "jsx-a11y/tabindex-no-positive": "error",
      },
    },
  ]
}
