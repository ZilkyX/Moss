import { ArrowUpRight } from "lucide-react"

const GITHUB_URL = "https://github.com/ZilkyX/Moss"

/** One line: the privacy promise and the source link. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Files never leave your browser, except for background removal.</p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 self-start rounded-sm py-1 outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
        >
          GitHub
          <ArrowUpRight aria-hidden className="size-3.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </footer>
  )
}
