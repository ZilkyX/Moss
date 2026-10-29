import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

export default function ToolsLayout({ children }: LayoutProps<"/tools">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
