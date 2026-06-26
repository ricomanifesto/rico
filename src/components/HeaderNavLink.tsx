import type { HeaderNavItem } from "@/content/navigation";

type HeaderNavLinkVariant = "desktop" | "mobile";

interface HeaderNavLinkClassContract {
  readonly getLayoutClass: (isLast: boolean) => string;
  readonly inactiveClass: string;
}

const activeHeaderNavLinkClass = "header-nav-link-active";

const headerNavLinkClassContract: Record<HeaderNavLinkVariant, HeaderNavLinkClassContract> = {
  desktop: {
    getLayoutClass: (isLast) => (isLast ? "" : "mr-6"),
    inactiveClass: "text-gray-200",
  },
  mobile: {
    getLayoutClass: () => "inline-flex min-h-11 min-w-11 items-center justify-center",
    inactiveClass: "font-medium text-gray-200",
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
      className={`${layoutClass} header-nav-link text-sm transition-colors duration-300 ${activeClass}`}
    >
      {item.label}
    </a>
  );
}
