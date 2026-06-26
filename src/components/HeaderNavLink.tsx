import type { HeaderNavItem } from "@/content/navigation";

type HeaderNavLinkVariant = "desktop" | "mobile";

interface HeaderNavLinkClassContract {
  readonly getLayoutClass: (isLast: boolean) => string;
  readonly inactiveClass: string;
}

const activeHeaderNavLinkClass = "header-nav-link-active";

const headerNavLinkClassContract: Record<HeaderNavLinkVariant, HeaderNavLinkClassContract> = {
  desktop: {
    getLayoutClass: (isLast) => (isLast ? "" : "header-nav-link-desktop-spaced"),
    inactiveClass: "header-nav-link-idle",
  },
  mobile: {
    getLayoutClass: () => "header-nav-link-mobile",
    inactiveClass: "header-nav-link-idle",
  },
};

interface HeaderNavLinkProps {
  item: HeaderNavItem;
  isActive: boolean;
  isLast?: boolean;
  variant?: HeaderNavLinkVariant;
}

export default function HeaderNavLink({ item, isActive, isLast = false, variant = "desktop" }: HeaderNavLinkProps) {
  const { getLayoutClass, inactiveClass } = headerNavLinkClassContract[variant];
  const layoutClass = getLayoutClass(isLast);
  const activeClass = isActive ? activeHeaderNavLinkClass : inactiveClass;

  return (
    <a
      href={item.href}
      aria-current={isActive ? "location" : undefined}
      className={`${layoutClass} header-nav-link ${activeClass}`}
    >
      {item.label}
    </a>
  );
}
