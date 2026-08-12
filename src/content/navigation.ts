export interface HeaderNavItem {
  readonly label: string;
  readonly href: string;
}

export interface SiteBrand {
  readonly label: string;
  readonly href: string;
}

export interface HeaderNavigationBehavior {
  readonly defaultActiveHref: string;
  readonly activeSectionOffsetPx: number;
  readonly scrolledShadowThresholdPx: number;
  readonly scrollListenerOptions: AddEventListenerOptions;
}

export type SocialLinkKind = "email" | "github" | "linkedin" | "medium";

export interface SocialLinkBehavior {
  readonly externalTarget: "_blank";
  readonly externalRel: "noopener noreferrer";
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly kind: SocialLinkKind;
  readonly external: boolean;
}

export const headerNavItems: readonly HeaderNavItem[] = [
  { label: "Home", href: "/#intro" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Writing", href: "/writing/" },
  { label: "Contact", href: "mailto:michaelrico124@gmail.com" },
];

export const siteBrand: SiteBrand = {
  label: "Rico Manifesto",
  href: "/",
};

export const headerNavigationBehavior: HeaderNavigationBehavior = {
  defaultActiveHref: "/#intro",
  activeSectionOffsetPx: 160,
  scrolledShadowThresholdPx: 10,
  scrollListenerOptions: { passive: true },
};

export const contactLink: SocialLink = {
  label: "Email",
  href: "mailto:michaelrico124@gmail.com",
  kind: "email",
  external: false,
};

export const socialLinkBehavior: SocialLinkBehavior = {
  externalTarget: "_blank",
  externalRel: "noopener noreferrer",
};

export const socialLinks: readonly SocialLink[] = [
  contactLink,
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
