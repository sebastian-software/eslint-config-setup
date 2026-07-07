/**
 * A tiny, dependency-free tokenizer for the narrow slice of TypeScript shown
 * on the homepage (imports, a call, string/boolean literals, comments).
 *
 * The bundled docs code-block only gets Shiki highlighting through a
 * build-time plugin, which cannot run on the configurator's dynamic snippets.
 * This gives every code block on the page the same look, highlighted
 * client-side, with no dependency and no per-keystroke cost worth measuring.
 */
export type Token = {
  type: string
  value: string
  start: number
}

/**
 * One sticky pattern; the first alternative to match at a position wins.
 * Order matters — keywords before identifiers, calls before plain names.
 */
const PATTERN =
  /(?<space>\s+)|(?<comment>\/\/[^\n]*)|(?<string>"[^"]*"|'[^']*')|(?<keyword>\b(?:import|from|export|default|await|const|let|return|function|new|typeof|as)\b)|(?<atom>\b(?:true|false|null|undefined|\d+)\b)|(?<fn>[A-Za-z_$][\w$]*(?=\())|(?<key>[A-Za-z_$][\w$]*(?=\s*:))|(?<ident>[A-Za-z_$][\w$]*)|(?<punc>\S)/y

const TYPES = ["space", "comment", "string", "keyword", "atom", "fn", "key", "ident", "punc"]

function typeOf(groups: Record<string, string | undefined>): string {
  return TYPES.find((type) => groups[type] !== undefined) ?? "punc"
}

export function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  PATTERN.lastIndex = 0
  let match = PATTERN.exec(code)

  while (match !== null) {
    tokens.push({
      type: typeOf(match.groups ?? {}),
      value: match[0],
      start: match.index,
    })
    match = PATTERN.exec(code)
  }

  return tokens
}
