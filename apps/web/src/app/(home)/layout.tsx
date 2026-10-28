// Shared shell for the site pages (home, about, guides, contact).
// The site header and footer go here once they are designed.
export default function HomeLayout({ children }: LayoutProps<"/">) {
  return <>{children}</>;
}
