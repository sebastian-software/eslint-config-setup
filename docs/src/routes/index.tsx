import { createFileRoute } from "@tanstack/react-router"
import { HomePage } from "ardo/theme"
import { PressProvider } from "ardo/runtime"
import config from "virtual:ardo/config"
import sidebar from "virtual:ardo/sidebar"
import { frontmatter, toc } from "../../content/index.md"

export const Route = createFileRoute("/")({
  component: HomeComponent,
})

function HomeComponent() {
  const pageData = {
    title: frontmatter.title || "Home",
    description: frontmatter.description,
    frontmatter,
    content: "",
    toc,
    filePath: "index.md",
    relativePath: "index.md",
  }

  return (
    <PressProvider config={config} sidebar={sidebar} currentPage={pageData}>
      <HomePage />
    </PressProvider>
  )
}
