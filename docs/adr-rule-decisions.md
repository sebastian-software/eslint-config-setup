# ADR: Rule-by-Rule Decisions

Architectural Decision Record für bewusste Abweichungen von anderen prominenten ESLint-Configs (Ultracite, XO, Antfu).

## Leitprinzip

**eslint-config-setup priorisiert Lesbarkeit und Zugänglichkeit.** Bei Abwägungen zwischen Kompaktheit und Klarheit gewinnt Klarheit. Code soll auch für weniger erfahrene Entwickler intuitiv lesbar sein.

## Methodik

Jede Regel wurde im Vergleich zu Ultracite, XO und @antfu/eslint-config evaluiert. Hier werden nur bewusste Abweichungen dokumentiert — Regeln wo wir übereinstimmen werden nicht aufgeführt.

---

## Bewusst nicht übernommen

### `no-void` — nicht konfiguriert
**Wer hat es:** XO (`error`), Ultracite (`error`)
**Begründung:** Der `void`-Operator ist in modernem JS selten relevant. Der wichtigere Use-Case (floating promises markieren) wird durch `@typescript-eslint/no-floating-promises` abgedeckt.

### `block-scoped-var` — nicht konfiguriert
**Wer hat es:** XO (`error`), Antfu (`error`), Ultracite (`error`)
**Begründung:** Wir haben `no-var: error` — `var` ist komplett verboten. Damit ist `block-scoped-var` überflüssig.

### `default-case` — nicht konfiguriert
**Wer hat es:** XO (`error`), Ultracite (`error`)
**Begründung:** TypeScript ist bei uns immer aktiv. `@typescript-eslint/switch-exhaustiveness-check` (AI-Modus) ist smarter, weil es den Compiler nutzt statt blind einen `default`-Case zu fordern.

### `no-implied-eval` (Core) — nicht konfiguriert
**Wer hat es:** XO (`error`), Ultracite (`error`)
**Begründung:** TypeScript ist immer aktiv. Die `@typescript-eslint/no-implied-eval` aus dem `strictTypeChecked` Preset deckt dasselbe ab und deaktiviert die Core-Version automatisch.

### `prefer-destructuring` — nicht konfiguriert
**Wer hat es:** XO (`error`), Ultracite (`error` {object: true, array: false})
**Begründung:** Destructuring lohnt erst ab 2-3 Properties. Bei einem einzelnen Property ist `const foo = obj.foo` oft lesbarer. Die Regel bietet keine Mindestanzahl-Option, daher nicht aufgenommen.

### `import-x/no-anonymous-default-export` — nicht konfiguriert
**Wer hat es:** XO (`error`), Ultracite (`error`)
**Begründung:** Redundant mit `unicorn/no-anonymous-default-export`, das denselben Fall abdeckt. Unicorn ist bei uns die umfangreichere Regelbasis und wird aktiver gepflegt.

### `n/prefer-global/buffer` und `n/prefer-global/process` — `"always"`
**Wer macht es anders:** XO (`"never"`), Antfu (`"never"`)
**Begründung:** `Buffer` und `process` sind de-facto Globals wie `console` oder `Array`. Sie gehören zur Standardbibliothek und müssen nicht explizit importiert werden. Man importiert `Set` oder `Map` auch nicht.

### `prefer-arrow-callback` — nur AI-Modus
**Wer hat es im Base:** XO (`error`), Antfu (`error`), Ultracite (`error`)
**Begründung:** Stylistische Präferenz, kein Bug-Finder. Im Base-Modus soll nicht jeder Callback erzwungenermaßen eine Arrow-Function sein.

---

## Bewusst übernommen (aus Vergleich)

### `no-constant-binary-expression` — `error` (NEU)
**Quelle:** XO, Ultracite
**Begründung:** Vom ESLint-Team als einer der effektivsten Bug-Finder beschrieben. Fängt Operator-Precedence-Fallen und immer-truthy Ausdrücke ab.

### `no-useless-computed-key` — `{enforceForClassMembers: true}` (ERWEITERT)
**Quelle:** XO
**Begründung:** Unnötige computed keys in Klassen sind genauso überflüssig wie in Objekten.

### `use-isnan` — `{enforceForIndexOf, enforceForSwitchCase}` (ERWEITERT)
**Quelle:** XO, Antfu
**Begründung:** `arr.indexOf(NaN)` gibt immer `-1` zurück, `switch(NaN)` matcht nie — beides echte Bugs.

### `valid-typeof` — `{requireStringLiterals: true}` (ERWEITERT)
**Quelle:** Antfu
**Begründung:** Verhindert `typeof x === myVar` — fast immer ein Tippfehler.

### `consistent-type-imports` — `separate-type-imports` (ABWEICHUNG von XO/Ultracite)
**XO/Ultracite:** `inline-type-imports`
**Antfu:** `separate-type-imports`
**Begründung:** Separate Type-Imports sind klarer lesbar — man sieht sofort welche Zeilen nur Types importieren. Folgt dem Leitprinzip: Lesbarkeit vor Kompaktheit.

### `consistent-type-definitions` — `"type"` (IN BASE HOCHGEZOGEN)
**Quelle:** XO, Ultracite (Antfu nutzt `"interface"`)
**Begründung:** `type` deckt 100% der Fälle ab (Unions, Tuples, Mapped Types). `interface` erlaubt Declaration Merging — ein implizites Verhalten das zu schwer auffindbaren Bugs führen kann.
