"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/** Moss defaults to the dark forest theme; visitors can switch to light. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
