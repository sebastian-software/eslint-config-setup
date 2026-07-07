import type { MetaFunction } from "react-router"

import { ArdoRoot, ArdoRootLayout as RootLayout } from "ardo/ui"
import config from "virtual:ardo/config"
import sidebar from "virtual:ardo/sidebar"
import "ardo/ui/styles.css"
import "@fontsource-variable/schibsted-grotesk/index.css"
import "@fontsource/fragment-mono/index.css"
import "@fontsource-variable/jetbrains-mono/index.css"

import "./homepage.css"

export const meta: MetaFunction = () => [{ title: config.title }]

export function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>
}

export default function Root() {
  return <ArdoRoot config={config} sidebar={sidebar} />
}
