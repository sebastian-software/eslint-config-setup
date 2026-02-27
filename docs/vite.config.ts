import { defineConfig } from 'vite'
import { ardo } from 'ardo/vite'

export default defineConfig({
  plugins: [
    ardo({
      title: 'ESLint Config Setup',
      description:
        'One import. 25+ plugins. TypeScript, React, Node.js, AI mode, OxLint — all handled.',

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
              { text: 'AI Mode', link: '/guide/ai-mode' },
              { text: 'OxLint Integration', link: '/guide/oxlint' },
              { text: 'Included Plugins', link: '/guide/plugins' },
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
