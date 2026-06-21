export interface HeaderNavItem {
  label: string;
  href: string;
}

export type SocialLinkKind = "email" | "github" | "linkedin" | "medium";

export interface SocialLink {
  label: string;
  href: string;
  kind: SocialLinkKind;
  external: boolean;
}

export const headerNavItems: readonly HeaderNavItem[] = [
  { label: "Home", href: "#intro" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "mailto:michaelrico124@gmail.com" },
];

export const socialLinks: readonly SocialLink[] = [
  {
    label: "Email",
    href: "mailto:michaelrico124@gmail.com",
    kind: "email",
    external: false,
  },
  {
    label: "GitHub",
    href: "https://github.com/ricomanifesto",
    kind: "github",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/michael-rico-19600314a",
    kind: "linkedin",
    external: true,
  },
  {
    label: "Medium",
    href: "https://medium.com/@ricomanifesto",
    kind: "medium",
    external: true,
  },
];
