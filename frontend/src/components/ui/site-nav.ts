export type SiteNavLink = {
  label: string;
  href: string;
};

export const primaryNavLinks = [
  { label: "Components", href: "/components" },
  { label: "Theme", href: "/theme" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
] satisfies SiteNavLink[];

export const pageNavLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
] satisfies SiteNavLink[];
