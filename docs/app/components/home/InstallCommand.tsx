import { useState } from "react"

import { INSTALL_COMMAND } from "./configuratorData"

const RESET_DELAY_MS = 2000

/**
 * The install command rendered as the primary call to action, with a copy
 * button. The command itself is the CTA — there is nothing else to click.
 */
export function InstallCommand() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(INSTALL_COMMAND).then(() => {
      setCopied(true)
      globalThis.setTimeout(() => {
        setCopied(false)
      }, RESET_DELAY_MS)
    })
  }

  return (
    <div className="hp-command">
      <code className="hp-command-text">
        <span aria-hidden="true" className="hp-command-prompt" />
        {INSTALL_COMMAND}
      </code>
      <button
        className="hp-command-copy"
        onClick={handleCopy}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}
