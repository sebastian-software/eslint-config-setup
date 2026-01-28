# Ardo Issues

Issues to report at https://github.com/sebastian-software/ardo/issues

## 1. create-ardo CLI not published to npm

The README documents a CLI scaffolding command:

```bash
pnpm create ardo@latest my-docs
```

However, `create-ardo` is not published on npm, so this command fails.

**Workaround:** Manual setup by copying the `examples/minimal` directory structure from the repo.

## 2. Published build missing tanstackStart, react, and prerender plugins

The source code at `packages/ardo/src/vite/plugin.ts` includes:

```typescript
const tanstackPlugin = tanstackStart({
  prerender: {
    enabled: prerender?.enabled ?? true,
    crawlLinks: prerender?.crawlLinks ?? true,
  },
})
// ...
const reactPlugin = react()
```

But the published build (`ardo@1.0.2`, `dist/chunk-EME22RC7.js`) does not contain `tanstackStart` or `react()`. These plugins are stripped during bundling.

This means `vite build` fails with `Cannot resolve entry module index.html` because TanStack Start's entry point handling is missing.

**Workaround:** Add `tanstackStart` manually in `vite.config.ts` (no separate `react()` plugin needed — `tanstackStart` handles JSX transformation):

```typescript
import { ardoPlugin } from "ardo/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"

export default defineConfig({
  plugins: [
    ardoPlugin({ ... }),
    tanstackStart({ prerender: { enabled: true, crawlLinks: true } }),
  ],
})
```

**Important:** `ardoPlugin` must come before `tanstackStart` so dynamic routes are generated before TanStack processes them.
