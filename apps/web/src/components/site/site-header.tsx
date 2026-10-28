import Link from "next/link"
import { MossLogo } from "@/components/brand/moss-logo"
import { ThemeToggle } from "@/components/site/theme-toggle"

/** Top bar for the site pages: logo home, the tools link and the theme switch. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Moss home" className="rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <MossLogo title="" className="h-6" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Link
            href="/#tools"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Tools
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
