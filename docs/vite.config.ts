import { defineConfig } from 'vite'
import { ardo } from 'ardo/vite'

export default defineConfig({
  plugins: [
    ardo({
      title: 'ESLint Config Setup',
      description: 'Built with Ardo',

      typedoc: true,

      // GitHub Pages: base path auto-detected from git remote

      themeConfig: {
        siteTitle: 'ESLint Config Setup',

        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api-reference' },
        ],

        sidebar: [
          {
            text: 'Guide',
            items: [{ text: 'Getting Started', link: '/guide/getting-started' }],
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
