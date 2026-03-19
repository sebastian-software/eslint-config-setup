/* eslint-disable max-lines-per-function -- Rule definition file: one function returning a flat list of rule entries. */
import stylisticPlugin from "@stylistic/eslint-plugin"
// @ts-expect-error -- no type declarations available
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import reactRefreshPlugin from "eslint-plugin-react-refresh"
import globals from "globals"

import {
  MARKDOWN_CODE_BLOCK_FILES,
  TYPESCRIPT_SOURCE_FILES,
} from "../file-patterns"
import { reactCompatPlugin } from "../plugins/react-compat"
import type { FlatConfigArray } from "../types"

/**
 * React config — React 19+, Hooks, JSX accessibility, and Web API leak detection.
 *
 * Uses `@eslint-react` (eslint-plugin-react-x) as the primary React linting plugin,
 * replacing the unmaintained eslint-plugin-react. All rules — including DOM, Web API,
 * hooks-extra, naming-convention, and RSC sub-plugins — are registered under a single
 * `react/` namespace via the react-compat plugin for maximum OxLint compatibility.
 *
 * Rules with a legacy `eslint-plugin-react` equivalent are registered under the
 * legacy name (e.g. `react/jsx-key` instead of `react/no-missing-key`) so that
 * OxLint can handle them natively. Rules without a legacy equivalent keep their
 * `@eslint-react` short name (e.g. `react/no-context-provider`).
 *
 * Stylistic JSX rules (self-closing, curly braces) are provided by `@stylistic`.
 *
 * @see https://eslint-react.xyz/docs/rules/overview
 * @see https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
 * @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
 * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#supported-rules
 */
export function reactConfig(): FlatConfigArray {
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
        // Unified react-compat plugin: all @eslint-react rules under "react/"
        // with legacy names for OxLint compatibility.
        react: reactCompatPlugin,
        // eslint-plugin-react-hooks stays as-is
        "react-hooks": reactHooksPlugin as Record<string, unknown>,
        "@stylistic": stylisticPlugin,
        "react-refresh": reactRefreshPlugin,
        "jsx-a11y": jsxA11yPlugin as Record<string, unknown>,
      },
      rules: {
        // ── JSX rules ───────────────────────────────────────────────────
        // Rules use legacy names where available (→ OxLint handles them).
        // Rules without legacy equivalent use @eslint-react short name.

        // Require key prop in iterators — prevent reconciliation bugs
        "react/jsx-key": "error",
        // Prevent duplicate key props in iterators
        "react/no-duplicate-key": "error",
        // Detect implicit keys from array position — fragile reconciliation
        "react/no-implicit-key": "error",
        // Spread after key means key gets overwritten silently
        "react/jsx-key-before-spread": "warn",
        // Prevent comments from being inserted as text nodes in JSX
        "react/jsx-no-comment-textnodes": "error",
        // Remove unnecessary JSX fragments — <>{x}</> → {x}
        "react/jsx-no-useless-fragment": "error",
        // Prefer <Foo active /> over <Foo active={true} />
        "react/jsx-boolean-value": "error",
        // Prevent `{count && <Foo />}` — renders "0" when count is 0
        "react/jsx-no-leaked-render": "error",
        // Prevent inline object creation in context providers — re-renders
        "react/jsx-no-constructed-context-values": "error",
        // Prevent javascript: URLs — XSS risk
        "react/jsx-no-script-url": "warn",
        // Prevent IIFE in JSX — move logic outside render
        "react/jsx-no-iife": "error",
        // Prefer destructuring: ({foo}) over (props) => props.foo
        "react/destructuring-assignment": "warn",

        // ── Component patterns ──────────────────────────────────────────

        // Prevent passing children as a prop — use JSX children syntax
        "react/no-children-prop": "error",
        // Prevent using array index as key — breaks reconciliation on reorder
        "react/no-array-index-key": "error",
        // Prevent object/array literals as default props — new ref every render
        "react/no-object-type-as-default-prop": "error",
        // Prevent unstable nested component definitions — causes remounts
        "react/no-unstable-nested-components": "error",
        // Prevent nested lazy() declarations — causes remount on every render
        "react/no-nested-lazy-component-declarations": "error",
        // Detect unused props — dead code
        "react/no-unused-props": "warn",
        // Prevent useless forwardRef wrapping (React 19: ref is a prop)
        "react/no-useless-forward-ref": "warn",

        // ── React 19 migration ──────────────────────────────────────────

        // React 19: Use <Context> instead of <Context.Provider>
        "react/no-context-provider": "error",
        // React 19: Use ref as prop instead of forwardRef
        "react/forward-ref-uses-ref": "error",
        // React 19: Use use() instead of useContext()
        "react/no-use-context": "error",

        // ── Children API (prefer composition over Children utilities) ───

        "react/no-children-count": "warn",
        "react/no-children-for-each": "warn",
        "react/no-children-map": "warn",
        "react/no-children-only": "warn",
        "react/no-children-to-array": "warn",
        // Prefer composition over cloneElement — fragile implicit prop passing
        "react/no-clone-element": "warn",

        // ── Class component rules (flag legacy patterns) ────────────────

        // Prefer function components — class components are legacy
        "react/no-class-component": "error",
        // Use useRef instead of createRef
        "react/no-create-ref": "error",
        // Use default parameters instead of defaultProps
        "react/no-default-props": "error",
        // Use TypeScript instead of PropTypes
        "react/prop-types": "error",
        // Use ref callbacks or useRef instead of string refs
        "react/no-string-refs": "error",
        // Prevent direct mutation of this.state — use setState
        "react/no-direct-mutation-state": "error",
        // Prevent this.setState({ count: this.state.count + 1 }) — race condition
        "react/no-access-state-in-setstate": "error",
        // PureComponent already implements shouldComponentUpdate
        "react/no-redundant-should-component-update": "error",
        // Detect unused class component members — dead code
        "react/no-unused-class-component-members": "warn",
        // Detect state properties that are set but never read
        "react/no-unused-state": "error",
        // Deprecated lifecycle methods
        "react/no-component-will-mount": "error",
        "react/no-component-will-receive-props": "error",
        "react/no-component-will-update": "error",
        // UNSAFE_ lifecycle methods — migration path
        "react/no-unsafe-component-will-mount": "warn",
        "react/no-unsafe-component-will-receive-props": "warn",
        "react/no-unsafe-component-will-update": "warn",
        // Prevent setState in lifecycle methods — causes double renders
        "react/no-did-mount-set-state": "warn",
        "react/no-did-update-set-state": "warn",
        "react/no-will-update-set-state": "warn",

        // ── Hooks optimization ──────────────────────────────────────────

        // Prevent unnecessary useCallback/useMemo — only wrap when needed
        "react/no-unnecessary-use-callback": "warn",
        "react/no-unnecessary-use-memo": "warn",
        // Prevent "use" prefix on non-hooks — confusing naming
        "react/no-unnecessary-use-prefix": "warn",
        // Prevent direct setState in useEffect — often a smell
        "react/no-direct-set-state-in-use-effect": "warn",
        // useState with expensive initializer should use lazy form
        "react/prefer-use-state-lazy-initialization": "warn",

        // ── Naming conventions ──────────────────────────────────────────

        // useState destructuring: [value, setValue] pattern
        "react/hook-use-state": "warn",
        // Context display names must follow convention
        "react/context-name": "warn",
        // Component/hook id naming convention
        "react/id-name": "warn",
        // Ref naming convention
        "react/ref-name": "warn",

        // ── DOM rules ───────────────────────────────────────────────────

        // Prevent unsafe target="_blank" links — requires rel="noreferrer"
        "react/jsx-no-target-blank": "error",
        // Prevent unknown DOM properties (e.g., class → className)
        "react/no-unknown-property": "error",
        // Prevent void DOM elements (br, img, hr) from having children
        "react/void-dom-elements-no-children": "error",
        // Require sandbox attribute on iframes
        "react/iframe-missing-sandbox": "error",
        // Prevent unsafe iframe sandbox values (allow-scripts + allow-same-origin)
        "react/no-unsafe-iframe-sandbox": "warn",
        // Prevent `style="color: red"` — must be an object in React
        "react/style-prop-object": "error",
        // Require explicit type on <button> — prevents unintended form submits
        "react/button-has-type": "error",
        // Prevent dangerouslySetInnerHTML + children at the same time
        "react/no-danger-with-children": "error",
        // Warn on dangerouslySetInnerHTML — XSS risk, should be reviewed
        "react/no-danger": "warn",
        // Prevent ReactDOM.findDOMNode — use refs instead
        "react/no-find-dom-node": "error",
        // Prevent ReactDOM.render return value — unreliable
        "react/no-render-return-value": "error",
        // Prevent SVG namespace — not supported in React
        "react/no-namespace": "error",
        // React 18: Use hydrateRoot instead of ReactDOM.hydrate
        "react/no-hydrate": "error",
        // React 18: Use createRoot instead of ReactDOM.render
        "react/no-render": "error",
        // Prefer batched updates over flushSync
        "react/no-flush-sync": "error",
        // React 19: Use useActionState instead of useFormState
        "react/no-use-form-state": "error",

        // ── Web API leak detection ──────────────────────────────────────

        "react/no-leaked-event-listener": "error",
        "react/no-leaked-interval": "error",
        "react/no-leaked-timeout": "error",
        "react/no-leaked-resize-observer": "error",

        // ── Misc ────────────────────────────────────────────────────────

        // Prevent misuse of captureOwnerStack (React 19)
        "react/no-misused-capture-owner-stack": "error",
        // RSC: Enforce function definition conventions for server components
        "react/function-definition": "error",

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
    {
      name: "eslint-config-setup/react-typescript",
      files: [...TYPESCRIPT_SOURCE_FILES],
      ignores: [...MARKDOWN_CODE_BLOCK_FILES],
      rules: {
        // Allow async event handlers — onClick={async () => {...}} is idiomatic React
        // https://typescript-eslint.io/rules/no-misused-promises
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: false },
        ],
      },
    },
  ]
}
