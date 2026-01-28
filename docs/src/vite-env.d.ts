/// <reference types="vite/client" />

declare module "virtual:ardo/config" {
  import type { PressConfig } from "ardo"
  const config: PressConfig
  export default config
}

declare module "virtual:ardo/sidebar" {
  import type { SidebarItem } from "ardo"
  const sidebar: SidebarItem[]
  export default sidebar
}

declare module "*.md" {
  import type { ComponentType } from "react"
  import type { PageFrontmatter, TOCItem } from "ardo"

  export const frontmatter: PageFrontmatter
  export const toc: TOCItem[]
  const component: ComponentType
  export default component
}
