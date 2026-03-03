# Changelog

## [0.2.0](https://github.com/sebastian-software/eslint-config-setup/compare/eslint-config-setup-v0.1.0...eslint-config-setup-v0.2.0) (2026-03-03)


### Features

* add 11 new regexp rules (5 base, 6 AI) ([77e7189](https://github.com/sebastian-software/eslint-config-setup/commit/77e7189fb217fa1b5edbc4d0ccf8057139eccf7c))
* add 13 new rules from ESLint core and typescript-eslint ([083b9f5](https://github.com/sebastian-software/eslint-config-setup/commit/083b9f5667099e2667e20c4ed70781857c6e4d20))
* add 15 new sonarjs rules (10 base, 5 AI) ([cd18811](https://github.com/sebastian-software/eslint-config-setup/commit/cd188112a3aa1f34efbd7ec89b96066f4e11d2e6))
* add 33 new unicorn rules (22 base, 11 AI) ([96a716c](https://github.com/sebastian-software/eslint-config-setup/commit/96a716c7d41358c1ad8a81275b677809e768456c))
* add batch 3 rules (import-x, jsdoc, node, react, jsx-a11y) ([aee5e7b](https://github.com/sebastian-software/eslint-config-setup/commit/aee5e7b5332dff8f991b28be3f266a94f5941d7d))
* add browser compat checking via eslint-plugin-compat ([dabce31](https://github.com/sebastian-software/eslint-config-setup/commit/dabce31f2b36ab8bfddc6d601500dabab9157cb5))
* add de-morgan, package-json, and react-effect configs ([c9537f8](https://github.com/sebastian-software/eslint-config-setup/commit/c9537f8d6367e506a9a3f4f448496940d404db4a))
* add eslint-plugin-react-refresh for HMR compatibility ([991e0f5](https://github.com/sebastian-software/eslint-config-setup/commit/991e0f52f60ea7a885ac7ae16bf62925bc452d8d))
* add new rules from major plugin updates ([3b99494](https://github.com/sebastian-software/eslint-config-setup/commit/3b99494733b1adfb872381fcd45f5bf049c6cd57))
* add perfectionist plugin and switch markdown to eslint-plugin-mdx ([83c0e5e](https://github.com/sebastian-software/eslint-config-setup/commit/83c0e5e5be4b11771f2f0cba14e0b04cb19c7e8d))
* add pre-generated OxLint configs via getOxlintConfig() ([5a5b148](https://github.com/sebastian-software/eslint-config-setup/commit/5a5b148bbe54d43e2e16e66c29a5d53f598b1b5e))
* add self-linting with own ESLint config (dogfooding) ([efe9322](https://github.com/sebastian-software/eslint-config-setup/commit/efe9322dc469fcfaae24830817dc8bc78f43d1ef))
* decouple storybook from react flag, add recommended addons page ([e27b825](https://github.com/sebastian-software/eslint-config-setup/commit/e27b825577a798f637ed1befdc666c2e76e7c235))
* decouple testing-library from react flag ([a145d85](https://github.com/sebastian-software/eslint-config-setup/commit/a145d859a7158075580af556d153878cbe1c3337))
* remove deprecated eslint-plugin-react-compiler ([33de72a](https://github.com/sebastian-software/eslint-config-setup/commit/33de72a124724c61c270d94e6ba6cdf95bd6835c))
* replace JSON serialization with codegen producing real ES modules ([149d18b](https://github.com/sebastian-software/eslint-config-setup/commit/149d18b4384a312246cce024b86808300f80095a))
* restructure as pnpm monorepo with docs workspace ([e075b53](https://github.com/sebastian-software/eslint-config-setup/commit/e075b535c316a6945824664b969ed8779f9c636e))
* upgrade to ESLint 10 and @eslint/js 10 ([e607ed4](https://github.com/sebastian-software/eslint-config-setup/commit/e607ed45808663ae60d6bcc29dc6e4b364d528e5))


### Bug Fixes

* add file-level eslint-disable for inherent complexity ([1b3527c](https://github.com/sebastian-software/eslint-config-setup/commit/1b3527c4644b56b6da9534df9ffdb4594a7017a9))
* add type assertions for ESM plugin imports ([d7b4861](https://github.com/sebastian-software/eslint-config-setup/commit/d7b4861982efbe93b611869cfce5f2b69dea523e))
* allow numbers in template literals via rule config ([c3e99b3](https://github.com/sebastian-software/eslint-config-setup/commit/c3e99b3ce5a0e36ec1fc1a1661296bcd305e02d2))
* auto-fix lint issues (Link components, boolean comparison) ([609b4e8](https://github.com/sebastian-software/eslint-config-setup/commit/609b4e8d445d96a9dbba0c1f926fdcb53b4c83ca))
* disable unicorn/no-immediate-mutation (stylistic, not a bug) ([18a6e80](https://github.com/sebastian-software/eslint-config-setup/commit/18a6e80de1bbf88df94036a7e05d94a4d4a32fbd))
* escape inline JSDoc tags, disable jsdoc/require-yields ([df20612](https://github.com/sebastian-software/eslint-config-setup/commit/df20612bc656b071e6e0b7d841968852e0baa83c))
* make config-builder and tests type-safe for TypeDoc ([a21d2d5](https://github.com/sebastian-software/eslint-config-setup/commit/a21d2d5df95bcc8b4734cdb56779c8823d269182))
* release readiness — externals, targets, CI, naming ([b09e196](https://github.com/sebastian-software/eslint-config-setup/commit/b09e1967f20767f049b982583d522e5bc7b4c286))
* remove non-null assertions and unsafe assignment ([87e0c41](https://github.com/sebastian-software/eslint-config-setup/commit/87e0c41e532ca90c684bf4e962ba124cd61e67be))
* resolve async, import, and test lint errors ([3db51d7](https://github.com/sebastian-software/eslint-config-setup/commit/3db51d75dfd6adb1b05c03cef8ffae81496de97a))
* resolve immediate-mutation, collapsible-if, and no-shadow errors ([e9ee1a7](https://github.com/sebastian-software/eslint-config-setup/commit/e9ee1a7ab6a1286ef70dfa115692bcd31f933290))
* resolve strict-boolean-expressions lint errors ([8412445](https://github.com/sebastian-software/eslint-config-setup/commit/8412445e0397c38b0cfbe94ab55bc9de3c86098b))
* TS errors in compose.test.ts, fix tsc resolution on Windows/macOS ([b98482d](https://github.com/sebastian-software/eslint-config-setup/commit/b98482d90df46dbccad0d588398712ed815c386f))
* tune lint rules for dogfooding — relax tests, jsdoc, tag-lines ([a91603f](https://github.com/sebastian-software/eslint-config-setup/commit/a91603f998606345beb9858c0a93c04ca233af1f))
* **unicorn:** disable prefer-single-call — no real benefit, hurts readability ([2860732](https://github.com/sebastian-software/eslint-config-setup/commit/286073264aef0d901b4504d4965554756e751466))
* use utf8 encoding identifier, add codegen to dictionary ([b51aeb3](https://github.com/sebastian-software/eslint-config-setup/commit/b51aeb3313df717f80f52b1db794f55c09bb1456))
* **vitest:** use toStrictEqual() instead of toEqual() in all tests ([fbaa0a0](https://github.com/sebastian-software/eslint-config-setup/commit/fbaa0a0026194fc298dcccce806c514bc7f03df1))
* wrap numbers in String() for template literal expressions ([26d2479](https://github.com/sebastian-software/eslint-config-setup/commit/26d2479a5824b83e665f41c387f016670c673955))
