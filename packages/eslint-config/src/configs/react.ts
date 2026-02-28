import globals from "globals"

import type { FlatConfigArray } from "../types"

/**
 * React config — React 19+, Hooks, Compiler (Server Components), and JSX accessibility.
 *
 * We hand-pick rules instead of using plugin presets because:
 * - `eslint-plugin-react`'s recommended preset includes `react-in-jsx-scope` which
 *   is unnecessary since React 17 JSX transform
 * - We want explicit control over each rule and its severity
 * - jsx-a11y has no flat config preset yet
 *
 * @see https://github.com/jsx-eslint/eslint-plugin-react#list-of-supported-rules
 * @see https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
 * @see https://react.dev/learn/react-compiler
 * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#supported-rules
 */
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
        // ── React core ────────────────────────────────────────────────

        // Prevent unsafe target="_blank" links — requires rel="noreferrer"
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md
        "react/jsx-no-target-blank": "error",

        // Prevent usage of undefined JSX components — catches typos
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-undef.md
        "react/jsx-no-undef": "error",

        // OFF: Not needed with React 17+ automatic JSX transform
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-uses-react.md
        "react/jsx-uses-react": "off",

        // OFF: Not needed with React 17+ automatic JSX transform
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md
        "react/react-in-jsx-scope": "off",

        // Warn on dangerouslySetInnerHTML — XSS risk, should be reviewed
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger.md
        "react/no-danger": "warn",

        // Prevent usage of deprecated React APIs — stay current
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-deprecated.md
        "react/no-deprecated": "error",

        // Prevent direct mutation of this.state — use setState instead
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-direct-mutation-state.md
        "react/no-direct-mutation-state": "error",

        // Prevent unknown DOM properties (e.g., class → className)
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
        "react/no-unknown-property": "error",

        // Prevent unstable nested component definitions — causes remounts
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md
        "react/no-unstable-nested-components": "error",

        // Prevent passing children as a prop — use JSX children syntax instead
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-children-prop.md
        "react/no-children-prop": "error",

        // Enforce self-closing tags for components without children — <Foo />
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
        "react/self-closing-comp": "error",

        // Prevent void DOM elements (br, img, hr) from having children
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/void-dom-elements-no-children.md
        "react/void-dom-elements-no-children": "error",

        // OFF: TypeScript handles prop validation
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md
        "react/prop-types": "off",

        // Require key prop in iterators — including fragment shorthand
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
        "react/jsx-key": ["error", { checkFragmentShorthand: true }],

        // Prevent comments from being inserted as text nodes in JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-comment-textnodes.md
        "react/jsx-no-comment-textnodes": "error",

        // Prevent duplicate props — always a bug
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-duplicate-props.md
        "react/jsx-no-duplicate-props": "error",

        // Remove unnecessary JSX fragments — <>{x}</> → {x}
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-useless-fragment.md
        "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],

        // Enforce PascalCase for component names — React convention
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md
        "react/jsx-pascal-case": "error",

        // Prefer <Foo active /> over <Foo active={true} /> — concise
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md
        "react/jsx-boolean-value": ["error", "never"],

        // Prevent unnecessary string curly braces: title={"foo"} → title="foo"
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
        "react/jsx-curly-brace-presence": [
          "error",
          { props: "never", children: "never" },
        ],

        // Enforce function declarations for named components, arrows for unnamed
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/function-component-definition.md
        "react/function-component-definition": [
          "error",
          {
            namedComponents: "function-declaration",
            unnamedComponents: "arrow-function",
          },
        ],

        // Enforce destructured useState naming: const [foo, setFoo] = useState()
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/hook-use-state.md
        "react/hook-use-state": "error",

        // Require sandbox attribute on iframes — security best practice
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/iframe-missing-sandbox.md
        "react/iframe-missing-sandbox": "error",

        // Prevent using array index as key — breaks reconciliation on reorder
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
        "react/no-array-index-key": "error",

        // Prevent object/array literals as default props — creates new reference every render
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-object-type-as-default-prop.md
        "react/no-object-type-as-default-prop": "error",

        // Prevent `{count && <Foo />}` — renders "0" when count is 0
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-leaked-render.md
        "react/jsx-no-leaked-render": "error",

        // Prevent inline object creation in context providers — causes re-renders
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md
        "react/jsx-no-constructed-context-values": "error",

        // Prevent `this.setState({ count: this.state.count + 1 })` — race condition
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-access-state-in-setstate.md
        "react/no-access-state-in-setstate": "error",

        // Detect state properties that are set but never read — dead code
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-state.md
        "react/no-unused-state": "error",

        // Prevent `style="color: red"` — must be an object in React
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/style-prop-object.md
        "react/style-prop-object": "error",

        // No string refs — deprecated since React 16.3, use useRef
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-string-refs.md
        "react/no-string-refs": "error",

        // Require explicit type on <button> — prevents unintended form submits
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/button-has-type.md
        "react/button-has-type": "error",

        // Prevent dangerouslySetInnerHTML + children at the same time — conflict
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger-with-children.md
        "react/no-danger-with-children": "error",

        // ── React Hooks ───────────────────────────────────────────────

        // Enforce Rules of Hooks — hooks must be called at the top level
        // https://react.dev/reference/rules/rules-of-hooks
        "react-hooks/rules-of-hooks": "error",

        // Verify dependency arrays in useEffect/useMemo/useCallback
        // https://react.dev/reference/react/useEffect#specifying-reactive-dependencies
        "react-hooks/exhaustive-deps": "error",

        // ── React Compiler (React 19+) ────────────────────────────────

        // Validates code is compatible with React Compiler's auto-memoization
        // https://react.dev/learn/react-compiler
        "react-compiler/react-compiler": "error",

        // ── JSX Accessibility (a11y) ──────────────────────────────────

        // Require alt text on img, area, input[type="image"], object
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/alt-text.md
        "jsx-a11y/alt-text": "error",

        // Require anchor content — empty links are inaccessible
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/anchor-has-content.md
        "jsx-a11y/anchor-has-content": "error",

        // Require valid href on anchors — no `#` or `javascript:` void
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/anchor-is-valid.md
        "jsx-a11y/anchor-is-valid": "error",

        // Active descendant elements must be focusable (tabindex)
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/aria-activedescendant-has-tabindex.md
        "jsx-a11y/aria-activedescendant-has-tabindex": "error",

        // Validate aria-* attributes exist — catches typos in ARIA props
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/aria-props.md
        "jsx-a11y/aria-props": "error",

        // Validate aria-* values match their type (boolean, token, etc.)
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/aria-proptypes.md
        "jsx-a11y/aria-proptypes": "error",

        // Validate role attribute values — catches invalid role names
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/aria-role.md
        "jsx-a11y/aria-role": "error",

        // Prevent ARIA on elements that don't support it (meta, script, style)
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/aria-unsupported-elements.md
        "jsx-a11y/aria-unsupported-elements": "error",

        // Click handlers must have keyboard equivalent — keyboard accessibility
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/click-events-have-key-events.md
        "jsx-a11y/click-events-have-key-events": "error",

        // Heading elements must have content — screen readers need it
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/heading-has-content.md
        "jsx-a11y/heading-has-content": "error",

        // Require lang attribute on <html> — language identification
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/html-has-lang.md
        "jsx-a11y/html-has-lang": "error",

        // Prevent redundant alt text like "image of..." — screen readers add this
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/img-redundant-alt.md
        "jsx-a11y/img-redundant-alt": "error",

        // Every form label must be associated with a control
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/label-has-associated-control.md
        "jsx-a11y/label-has-associated-control": "error",

        // Mouse event handlers must have keyboard equivalents
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/mouse-events-have-key-events.md
        "jsx-a11y/mouse-events-have-key-events": "error",

        // No accessKey attribute — inconsistent shortcuts confuse users
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/no-access-key.md
        "jsx-a11y/no-access-key": "error",

        // No autofocus attribute (except non-DOM) — disorienting for screen readers
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/no-autofocus.md
        "jsx-a11y/no-autofocus": ["error", { ignoreNonDOM: true }],

        // No <marquee>/<blink> — deprecated distracting elements
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/no-distracting-elements.md
        "jsx-a11y/no-distracting-elements": "error",

        // No redundant ARIA roles (e.g., <button role="button">)
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/no-redundant-roles.md
        "jsx-a11y/no-redundant-roles": "error",

        // Role elements must have all required ARIA props
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/role-has-required-aria-props.md
        "jsx-a11y/role-has-required-aria-props": "error",

        // Don't use unsupported ARIA attributes for a given role
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/role-supports-aria-props.md
        "jsx-a11y/role-supports-aria-props": "error",

        // scope attribute only on <th> elements — HTML specification
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/scope.md
        "jsx-a11y/scope": "error",

        // No positive tabIndex values — disrupts natural tab order
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/tabindex-no-positive.md
        "jsx-a11y/tabindex-no-positive": "error",

        // Validate lang attribute values — e.g. "de" ok, "deutsch" not
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/lang.md
        "jsx-a11y/lang": "error",

        // Validate autocomplete attribute values on form elements
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/autocomplete-valid.md
        "jsx-a11y/autocomplete-valid": "error",
      },
    },
  ]
}
