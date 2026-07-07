type FlagSwitchProps = {
  checked: boolean
  description: string
  label: string
  onToggle: () => void
}

/**
 * Accessible toggle: a real button with `role="switch"` and a visible label.
 * State is announced via `aria-checked`; the visual track mirrors it.
 */
export function FlagSwitch({ checked, description, label, onToggle }: FlagSwitchProps) {
  return (
    <button
      aria-checked={checked}
      className="hp-switch"
      onClick={onToggle}
      role="switch"
      type="button"
    >
      <span aria-hidden="true" className="hp-switch-track">
        <span className="hp-switch-thumb" />
      </span>
      <span className="hp-switch-text">
        <span className="hp-switch-label">{label}</span>
        <span className="hp-switch-desc">{description}</span>
      </span>
    </button>
  )
}
