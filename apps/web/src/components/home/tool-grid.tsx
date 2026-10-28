"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"
import SpotlightCard from "@/components/reactbits/spotlight-card"
import { toolHref, type Tool } from "@/lib/tools"
import { cn } from "@/lib/utils"

/** Tools as a grid of cards. Used on the home page and the /tools directory. */
export function ToolGrid({ tools, className }: { tools: Tool[]; className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {tools.map((tool) => (
        <li key={tool.slug}>{tool.status === "live" ? <LiveCard tool={tool} /> : <SoonCard tool={tool} />}</li>
      ))}
    </ul>
  )
}

// SpotlightCard draws its own surface and border; point them at the Moss tokens.
const spotlightTokens = {
  "--spotlight-card-surface": "color-mix(in oklch, var(--card) 50%, transparent)",
  "--spotlight-card-border": "var(--border)",
  "--spotlight-card-shadow": "none",
} as CSSProperties

function LiveCard({ tool }: { tool: Tool }) {
  const { resolvedTheme } = useTheme()

  return (
    <SpotlightCard
      theme={resolvedTheme === "light" ? "light" : "dark"}
      spotlightColor="var(--primary)"
      intensity={0.14}
      spotlightSize={260}
      borderGlow={0.9}
      proximity={48}
      flare={false}
      className="h-full rounded-xl"
      style={spotlightTokens}
    >
      <Link
        href={toolHref(tool)}
        className="group flex h-full flex-col gap-5 rounded-[inherit] p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <CardBody tool={tool}>
          <ArrowRight
            aria-hidden
            className="size-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
          />
        </CardBody>
      </Link>
    </SpotlightCard>
  )
}

function SoonCard({ tool }: { tool: Tool }) {
  return (
    <div className="flex h-full flex-col gap-5 rounded-xl border border-dashed border-border p-5 text-muted-foreground">
      <CardBody tool={tool} muted>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs">Soon</span>
      </CardBody>
    </div>
  )
}

function CardBody({ tool, muted, children }: { tool: Tool; muted?: boolean; children: React.ReactNode }) {
  const Icon = tool.icon
  return (
    <>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-lg transition-colors duration-200",
            muted ? "bg-muted/60" : "bg-secondary group-hover:bg-primary/15 group-hover:text-primary"
          )}
        >
          <Icon aria-hidden className="size-5" />
        </span>
        {children}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className={cn("font-medium", !muted && "text-foreground")}>{tool.name}</h3>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>
      <p className="mt-auto font-mono text-xs text-muted-foreground">{tool.formats}</p>
    </>
  )
}
