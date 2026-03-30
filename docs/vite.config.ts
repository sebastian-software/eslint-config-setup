import { ardo } from 'ardo/vite'
import { defineConfig } from 'vite'

import pkg from '../packages/eslint-config/package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    ardo({
      title: 'ESLint Config Setup',
      description:
        'One import. 27 plugins. TypeScript, React, Node.js, AI mode, OxLint — all handled.',

      project: {
        name: pkg.name,
        version: pkg.version,
        repository: pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''),
        license: pkg.license,
      },

      typedoc: {
        entryPoints: ["../packages/eslint-config/src/index.ts"],
      },

      themeConfig: {
        siteTitle: 'ESLint Config Setup',

        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api-reference' },
        ],

        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'Why This Exists', link: '/guide/why' },
              { text: 'Getting Started', link: '/guide/getting-started' },
            ],
          },
          {
            text: 'Configuration',
            items: [
              { text: 'Configuration', link: '/guide/configuration' },
              { text: 'Rule API', link: '/guide/rule-api' },
              { text: 'File Conventions', link: '/guide/file-conventions' },
            ],
          },
          {
            text: 'Features',
            items: [
              { text: 'React Linting', link: '/guide/react' },
              { text: 'AI Mode', link: '/guide/ai-mode' },
              { text: 'OxLint Integration', link: '/guide/oxlint' },
              { text: 'Included Plugins', link: '/guide/plugins' },
              { text: 'Recommended Addons', link: '/guide/addons' },
            ],
          },
          {
            text: 'Advanced',
            items: [
              { text: 'Modular Imports', link: '/guide/modular-imports' },
              { text: 'Architecture', link: '/guide/architecture' },
            ],
          },
          {
            text: 'Development',
            items: [
              { text: 'Contributing', link: '/guide/contributing' },
            ],
          },
          {
            text: 'Architecture Decisions',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/adr' },
              { text: '0001 Pre-built Configs', link: '/adr/0001-pre-built-configs' },
              { text: '0002 Code Generation', link: '/adr/0002-codegen' },
              { text: '0003 Bitmask Hashing', link: '/adr/0003-bitmask-hashing' },
              { text: '0004 Curated Rules', link: '/adr/0004-curated-rules' },
              { text: '0005 Strict TypeScript', link: '/adr/0005-strict-typescript' },
              { text: '0006 AI Mode', link: '/adr/0006-ai-mode' },
              { text: '0007 File-Scoped Overrides', link: '/adr/0007-file-scoped-overrides' },
              { text: '0008 Prettier Compatibility', link: '/adr/0008-prettier' },
              { text: '0009 OxLint Integration', link: '/adr/0009-oxlint-integration' },
              { text: '0010 OxLint over Biome', link: '/adr/0010-oxlint-over-biome' },
              { text: '0011 Perfectionist', link: '/adr/0011-perfectionist' },
              { text: '0012 Testing Plugins', link: '/adr/0012-testing-plugins' },
              { text: '0013 CSpell', link: '/adr/0013-cspell' },
              { text: '0014 Rule-Helpers API', link: '/adr/0014-rule-helpers' },
              { text: '0015 No Promise Plugin', link: '/adr/0015-no-promise' },
              { text: '0016 No Framework Linting', link: '/adr/0016-no-frameworks' },
              { text: '0017 @eslint-react Deferred', link: '/adr/0017-eslint-react-deferred' },
              { text: '0018 No Shopify Plugin', link: '/adr/0018-no-shopify' },
            ],
          },
          { text: 'API Reference', link: '/api-reference' },
        ],

        footer: {
          message: 'Released under the MIT License.',
        },

        search: {
          enabled: true,
        },
      },
    }),
  ],
})
