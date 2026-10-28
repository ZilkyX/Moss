import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Outfit matches the wordmark; Geist Mono is for file names, sizes and formats.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Moss",
    template: "%s · Moss",
  },
  description: "Simple tools. Powerful possibilities.",
  applicationName: "Moss",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1F16" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
