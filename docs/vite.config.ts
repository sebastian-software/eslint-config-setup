import { defineConfig } from 'vite'
import { ardo } from 'ardo/vite'

export default defineConfig({
  plugins: [
    ardo({
      title: 'eslint-config-setup',
      description: 'Pre-generated, opinionated ESLint configurations for TypeScript projects. Zero runtime overhead. Full type-checking. AI-ready.',

      typedoc: true,

      // GitHub Pages: base path auto-detected from git remote

      themeConfig: {
        siteTitle: 'eslint-config-setup',

        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api-reference' },
        ],

        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'Why This Exists', link: '/guide/why' },
              { text: 'Configuration Options', link: '/guide/configuration' },
              { text: "What's Included", link: '/guide/whats-included' },
              { text: 'AI Mode', link: '/guide/ai-mode' },
              { text: 'File-Specific Rules', link: '/guide/file-rules' },
              { text: 'Helper Functions', link: '/guide/customization' },
              { text: 'Full Example', link: '/guide/full-example' },
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
