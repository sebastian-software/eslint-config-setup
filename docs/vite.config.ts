import { defineConfig } from "vite"
import { ardoPlugin } from "ardo/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"

export default defineConfig({
  base: "/eslint-config-setup/",

  plugins: [
    // Ardo must come first to generate dynamic routes before TanStack processes them.
    ardoPlugin({
      title: "eslint-config-setup",
      description:
        "Pre-generated, opinionated ESLint configurations for TypeScript projects. Zero runtime overhead. Full type-checking. AI-ready.",

      themeConfig: {
        siteTitle: "eslint-config-setup",

        nav: [
          { text: "Guide", link: "/guide/getting-started" },
          {
            text: "GitHub",
            link: "https://github.com/sebastian-software/eslint-config-setup",
          },
          {
            text: "npm",
            link: "https://www.npmjs.com/package/eslint-config-setup",
          },
        ],

        sidebar: [
          {
            text: "Introduction",
            items: [
              { text: "Why This Exists", link: "/guide/why" },
              { text: "Getting Started", link: "/guide/getting-started" },
            ],
          },
          {
            text: "Configuration",
            items: [
              { text: "Options", link: "/guide/configuration" },
              { text: "AI Mode", link: "/guide/ai-mode" },
              { text: "File-Specific Rules", link: "/guide/file-rules" },
              { text: "What's Included", link: "/guide/whats-included" },
            ],
          },
          {
            text: "Customization",
            items: [
              { text: "Helper Functions", link: "/guide/customization" },
              { text: "Full Example", link: "/guide/full-example" },
            ],
          },
        ],

        footer: {
          message: "Released under the Apache License 2.0.",
          copyright: "Copyright 2024-2026 Sebastian Software GmbH",
        },

        search: {
          enabled: true,
          placeholder: "Search docs...",
        },

        editLink: {
          pattern:
            "https://github.com/sebastian-software/eslint-config-setup/edit/main/docs/content/:path",
          text: "Edit this page on GitHub",
        },

        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/sebastian-software/eslint-config-setup",
          },
          {
            icon: "npm",
            link: "https://www.npmjs.com/package/eslint-config-setup",
          },
        ],
      },
    }),

    // Workaround: ardo@1.0.2 doesn't bundle tanstackStart internally.
    // Remove when ardo ships a fix.
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
  ],
})
