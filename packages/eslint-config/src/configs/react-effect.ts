import type { FlatConfigArray } from "../types"

/**
 * React effect config — catches unnecessary useEffect anti-patterns.
 * Codifies the patterns from the React docs article "You Might Not Need an Effect".
 *
 * Complements react-hooks (which checks dependency arrays are correct) by
 * detecting when the entire effect is unnecessary — derived state, chained
 * state updates, prop-triggered resets, and more.
 *
 * @see https://react.dev/learn/you-might-not-need-an-effect
 * @see https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
 */
export function reactEffectConfig(): FlatConfigArray {
  return [
    {
      name: "eslint-config-setup/react-effect",
      plugins: {
        get "react-you-might-not-need-an-effect"() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("eslint-plugin-react-you-might-not-need-an-effect")
        },
      },
      rules: {
        // Disallow storing derived state in an effect — compute at render time or useMemo
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-derived-state": "error",

        // Disallow chaining state updates in an effect — update together instead
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-chain-state-updates": "error",

        // Disallow using state + effect as an event handler — call logic directly
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-event-handler": "error",

        // Disallow adjusting state when a prop changes — compute inline during render
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-adjust-state-on-prop-change": "warn",

        // Disallow resetting all state when a prop changes — use the key prop instead
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change": "error",

        // Disallow passing live state to parent via effect — lift state up instead
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-pass-live-state-to-parent": "error",

        // Disallow passing fetched data to parent via effect — fetch in parent instead
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-pass-data-to-parent": "error",

        // Disallow initializing state in an effect — pass initial value to useState
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-initialize-state": "error",

        // Disallow empty effects — dead code, remove them
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect
        "react-you-might-not-need-an-effect/no-empty-effect": "error",
      },
    },
  ]
}
