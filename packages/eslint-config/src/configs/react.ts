/* eslint-disable max-lines-per-function -- Rule definition file: one function returning a flat list of rule entries. */
import eslintReactPlugin from "@eslint-react/eslint-plugin"
import stylisticPlugin from "@stylistic/eslint-plugin"
// @ts-expect-error -- no type declarations available
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import reactRefreshPlugin from "eslint-plugin-react-refresh"
import globals from "globals"

import type { FlatConfigArray } from "../types"

/**
 * React config — React 19+, Hooks, JSX accessibility, and Web API leak detection.
 *
 * Uses `@eslint-react` (eslint-plugin-react-x) as the primary React linting plugin,
 * replacing the unmaintained eslint-plugin-react. Plugins are registered under
 * familiar namespaces (`react/`, `react-dom/`, `react-hooks/`) for compatibility
 * with OxLint and user overrides — the same pattern used for `import` (import-x)
 * and `node` (eslint-plugin-n).
 *
 * Stylistic JSX rules (self-closing, curly braces) are provided by `@stylistic`.
 *
 * @see https://eslint-react.xyz/docs/rules/overview
 * @see https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
 * @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
 * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#supported-rules
 */
export function reactConfig(): FlatConfigArray {
  // Extract sub-plugin objects from @eslint-react configs
  const reactDomPlugin = (eslintReactPlugin.configs.dom as Record<string, unknown>)
    .plugins as Record<string, unknown>
  const reactWebApiPlugin = (eslintReactPlugin.configs["web-api"] as Record<string, unknown>)
    .plugins as Record<string, unknown>

  return [
    {
      name: "eslint-config-setup/react",
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
        // @eslint-react core → registered as "react" (like import-x → "import")
        react: eslintReactPlugin,
        // @eslint-react/dom → registered as "react-dom"
        "react-dom": reactDomPlugin["@eslint-react/dom"] as Record<string, unknown>,
        // @eslint-react/web-api → registered as "react-web-api"
        "react-web-api": reactWebApiPlugin["@eslint-react/web-api"] as Record<string, unknown>,
        // eslint-plugin-react-hooks stays as-is
        "react-hooks": reactHooksPlugin as Record<string, unknown>,
        "@stylistic": stylisticPlugin,
        "react-refresh": reactRefreshPlugin,
        "jsx-a11y": jsxA11yPlugin as Record<string, unknown>,
      },
      rules: {
        // ── React core (react/) ─────────────────────────────────────────

        // Prevent passing children as a prop — use JSX children syntax instead
        // https://eslint-react.xyz/docs/rules/no-children-prop
        "react/no-children-prop": "error",

        // Prevent direct mutation of this.state — use setState instead
        // https://eslint-react.xyz/docs/rules/no-direct-mutation-state
        "react/no-direct-mutation-state": "error",

        // Prevent unstable nested component definitions — causes remounts
        // https://eslint-react.xyz/docs/rules/no-nested-component-definitions
        "react/no-nested-component-definitions": "error",

        // Require key prop in iterators — prevent reconciliation bugs
        // https://eslint-react.xyz/docs/rules/no-missing-key
        "react/no-missing-key": "error",

        // Prevent duplicate key props in iterators
        // https://eslint-react.xyz/docs/rules/no-duplicate-key
        "react/no-duplicate-key": "error",

        // Prevent comments from being inserted as text nodes in JSX
        // https://eslint-react.xyz/docs/rules/jsx-no-comment-textnodes
        "react/jsx-no-comment-textnodes": "error",

        // Remove unnecessary JSX fragments — <>{x}</> → {x}
        // https://eslint-react.xyz/docs/rules/no-useless-fragment
        "react/no-useless-fragment": "error",

        // Prefer <Foo active /> over <Foo active={true} /> — concise
        // https://eslint-react.xyz/docs/rules/jsx-shorthand-boolean
        "react/jsx-shorthand-boolean": "error",

        // Prevent using array index as key — breaks reconciliation on reorder
        // https://eslint-react.xyz/docs/rules/no-array-index-key
        "react/no-array-index-key": "error",

        // Prevent object/array literals as default props — creates new reference every render
        // https://eslint-react.xyz/docs/rules/no-unstable-default-props
        "react/no-unstable-default-props": "error",

        // Prevent `{count && <Foo />}` — renders "0" when count is 0
        // https://eslint-react.xyz/docs/rules/no-leaked-conditional-rendering
        "react/no-leaked-conditional-rendering": "error",

        // Prevent inline object creation in context providers — causes re-renders
        // https://eslint-react.xyz/docs/rules/no-unstable-context-value
        "react/no-unstable-context-value": "error",

        // Prevent `this.setState({ count: this.state.count + 1 })` — race condition
        // https://eslint-react.xyz/docs/rules/no-access-state-in-setstate
        "react/no-access-state-in-setstate": "error",

        // Detect state properties that are set but never read — dead code
        // https://eslint-react.xyz/docs/rules/no-unused-state
        "react/no-unused-state": "error",

        // ── React 19 migration rules ────────────────────────────────────

        // React 19: Use <Context> instead of <Context.Provider>
        // https://eslint-react.xyz/docs/rules/no-context-provider
        "react/no-context-provider": "error",

        // React 19: Use ref as prop instead of forwardRef
        // https://eslint-react.xyz/docs/rules/no-forward-ref
        "react/no-forward-ref": "error",

        // React 19: Use use() instead of useContext()
        // https://eslint-react.xyz/docs/rules/no-use-context
        "react/no-use-context": "error",

        // ── React DOM (react-dom/) ──────────────────────────────────────

        // Prevent unsafe target="_blank" links — requires rel="noreferrer"
        // https://eslint-react.xyz/docs/rules/dom-no-unsafe-target-blank
        "react-dom/no-unsafe-target-blank": "error",

        // Prevent unknown DOM properties (e.g., class → className)
        // https://eslint-react.xyz/docs/rules/dom-no-unknown-property
        "react-dom/no-unknown-property": "error",

        // Prevent void DOM elements (br, img, hr) from having children
        // https://eslint-react.xyz/docs/rules/dom-no-void-elements-with-children
        "react-dom/no-void-elements-with-children": "error",

        // Require sandbox attribute on iframes — security best practice
        // https://eslint-react.xyz/docs/rules/dom-no-missing-iframe-sandbox
        "react-dom/no-missing-iframe-sandbox": "error",

        // Prevent `style="color: red"` — must be an object in React
        // https://eslint-react.xyz/docs/rules/dom-no-string-style-prop
        "react-dom/no-string-style-prop": "error",

        // Require explicit type on <button> — prevents unintended form submits
        // https://eslint-react.xyz/docs/rules/dom-no-missing-button-type
        "react-dom/no-missing-button-type": "error",

        // Prevent dangerouslySetInnerHTML + children at the same time — conflict
        // https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml-with-children
        "react-dom/no-dangerously-set-innerhtml-with-children": "error",

        // Warn on dangerouslySetInnerHTML — XSS risk, should be reviewed
        // https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml
        "react-dom/no-dangerously-set-innerhtml": "warn",

        // ── React Web API (react-web-api/) — cleanup leak detection ─────

        // Require cleanup for addEventListener in effects
        // https://eslint-react.xyz/docs/rules/web-api-no-leaked-event-listener
        "react-web-api/no-leaked-event-listener": "error",

        // Require cleanup for setInterval in effects
        // https://eslint-react.xyz/docs/rules/web-api-no-leaked-interval
        "react-web-api/no-leaked-interval": "error",

        // Require cleanup for setTimeout in effects
        // https://eslint-react.xyz/docs/rules/web-api-no-leaked-timeout
        "react-web-api/no-leaked-timeout": "error",

        // Require cleanup for ResizeObserver in effects
        // https://eslint-react.xyz/docs/rules/web-api-no-leaked-resize-observer
        "react-web-api/no-leaked-resize-observer": "error",

        // ── React Hooks (react-hooks/) — eslint-plugin-react-hooks ──────

        // Enforce Rules of Hooks — hooks must be called at the top level
        // https://react.dev/reference/rules/rules-of-hooks
        "react-hooks/rules-of-hooks": "error",

        // Verify dependency arrays in useEffect/useMemo/useCallback
        // https://react.dev/reference/react/useEffect#specifying-reactive-dependencies
        "react-hooks/exhaustive-deps": "error",

        // ── @stylistic — JSX formatting rules ───────────────────────────

        // Enforce self-closing tags for components without children — <Foo />
        // https://eslint.style/rules/jsx/jsx-self-closing-comp
        "@stylistic/jsx-self-closing-comp": "error",

        // Prevent unnecessary string curly braces: title={"foo"} → title="foo"
        // https://eslint.style/rules/jsx/jsx-curly-brace-presence
        "@stylistic/jsx-curly-brace-presence": [
          "error",
          { props: "never", children: "never" },
        ],

        // ── React Refresh (Fast Refresh / HMR) ────────────────────────

        // Ensure components are exported in a way that supports Fast Refresh.
        // Mixed exports (component + constants) break HMR state preservation.
        // allowConstantExport: Vite handles constant exports without breaking HMR.
        // https://github.com/ArnaudBarre/eslint-plugin-react-refresh
        "react-refresh/only-export-components": [
          "warn",
          { allowConstantExport: true },
        ],

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
