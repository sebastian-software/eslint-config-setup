import { tokenize } from "./highlight"

type CodeBlockProps = {
  code: string
  title?: string
  className?: string
}

/**
 * Syntax-highlighted code, rendered directly on its container surface — no
 * nested panel. Highlighting is client-side (see ./highlight) so dynamic
 * snippets like the configurator's output stay in sync with the flags.
 */
export function CodeBlock({ code, title, className }: CodeBlockProps) {
  const tokens = tokenize(code)
  const wrapperClass = className === undefined ? "hp-code" : `hp-code ${className}`

  return (
    <figure className={wrapperClass}>
      {title === undefined ? null : (
        <figcaption className="hp-code-title">{title}</figcaption>
      )}
      <pre className="hp-code-pre">
        <code>
          {tokens.map((token) =>
            token.type === "space" ? (
              token.value
            ) : (
              <span className={`hp-tk-${token.type}`} key={token.start}>
                {token.value}
              </span>
            ),
          )}
        </code>
      </pre>
    </figure>
  )
}
