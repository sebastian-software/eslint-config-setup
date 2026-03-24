# Contributing

Thanks for considering a contribution! Here's how to get started.

## Setup

```bash
git clone https://github.com/sebastian-software/eslint-config-setup.git
cd eslint-config-setup
pnpm install
```

## Development

```bash
pnpm lint           # Run self-linting for package + docs workspace
pnpm check          # TypeScript type checking
pnpm test           # Run tests
pnpm test:coverage  # Run tests with coverage
pnpm build          # Build the package
pnpm generate       # Generate all config permutations
```

`pnpm install` also wires the repo-local `pre-push` hook, which runs `pnpm lint` automatically before pushes.

## How It Works

This package pre-generates ESLint configurations at build time. The build process:

1. Defines per-plugin configs in `src/configs/` (one file per plugin/concern)
2. Composes them via `src/build/compose.ts` based on feature flags (`strict`, `node`, `react`, etc.)
3. Iterates over all flag combinations to generate permutations
4. For each combination, generates file-specific configs (base, test, playwright, storybook)
5. Computes diffs between base and file-specific configs
6. Writes static JavaScript modules to `dist/configs/`

The key files:

- `src/configs/` — Individual plugin configurations
- `src/build/compose.ts` — Composes configs from feature flags
- `src/build/generate.ts` — Build script that generates all permutations
- `src/modules.ts` — Re-exports all plugin modules for consumers

## Adding Rules or Plugins

When adding new rules or plugins:

1. Add the plugin to `dependencies` in `packages/eslint-config/package.json` (not `devDependencies` — users need them)
2. Create or update a config file in `src/configs/`
3. Wire it into `src/build/compose.ts`
4. Run `pnpm test` and update snapshots with `pnpm --filter eslint-config-setup exec vitest run --update`
5. Run `pnpm build` to verify all configs generate correctly

## Pull Requests

- Keep changes focused — one feature or fix per PR
- Update tests and snapshots
- Update the docs if behavior changes
- Run `pnpm lint && pnpm check && pnpm test && pnpm build` before submitting

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Copyright (c) 2025 Sebastian Software GmbH
