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
pnpm check    # TypeScript type checking
pnpm test     # Run tests
pnpm build    # Generate all config permutations
pnpm lint     # Run ESLint
pnpm fix      # Auto-fix ESLint + Prettier
```

## How It Works

This package pre-generates ESLint configurations at build time. The build process:

1. Iterates over all flag combinations (`strict`, `node`, `react`, `ai`)
2. Generates a full ESLint config for each combination
3. For each combination, generates 4 file-specific configs (base, test, playwright, storybook)
4. Computes diffs between base and file-specific configs
5. Writes static JavaScript modules to `dist/configs/`

The key files:
- `src/generator.ts` - Core config generation logic
- `src/build.ts` - Build script that generates all permutations
- `src/diff.ts` - Computes minimal diffs between configs
- `src/util.ts` - Options, flags, and hashing

## Adding Rules

When adding new rules or plugins:

1. Add the plugin to `dependencies` (not `devDependencies` - users need them)
2. Add the preset or rules in `src/generator.ts`
3. Run `pnpm test` and update snapshots with `pnpm vitest run --update`
4. Run `pnpm build` to verify all 16 configs generate correctly

## Pull Requests

- Keep changes focused - one feature or fix per PR
- Update tests and snapshots
- Update the README if behavior changes
- Run `pnpm check && pnpm test && pnpm build` before submitting

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
