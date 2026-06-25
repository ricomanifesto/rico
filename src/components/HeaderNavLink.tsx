import type { HeaderNavItem } from "@/content/navigation";

type HeaderNavLinkVariant = "desktop" | "mobile";

interface HeaderNavLinkProps {
  item: HeaderNavItem;
  isActive: boolean;
  isLast?: boolean;
  variant?: HeaderNavLinkVariant;
}

export default function HeaderNavLink({ item, isActive, isLast = false, variant = "desktop" }: HeaderNavLinkProps) {
  const layoutClass =
    variant === "mobile" ? "inline-flex min-h-11 min-w-11 items-center justify-center" : isLast ? "" : "mr-6";
  const activeClass = isActive ? "font-semibold text-[#66b2ff]" : variant === "mobile" ? "font-medium text-gray-200" : "text-gray-200";

  return (
    <a
      href={item.href}
      aria-current={isActive ? "location" : undefined}
      className={`${layoutClass} text-sm transition-colors duration-300 hover:text-[#007bff] focus-visible:text-[#66b2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff] ${activeClass}`}
    >
      {item.label}
    </a>
  );
}
