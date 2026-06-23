import type { HeaderNavItem } from "@/content/navigation";

interface HeaderNavLinkProps {
  item: HeaderNavItem;
  isLast: boolean;
  isActive: boolean;
}

export default function HeaderNavLink({ item, isLast, isActive }: HeaderNavLinkProps) {
  return (
    <a
      href={item.href}
      aria-current={isActive ? "location" : undefined}
      className={`${isLast ? "" : "mr-6"} text-sm transition-colors duration-300 hover:text-[#007bff] focus-visible:text-[#66b2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff] ${
        isActive ? "font-semibold text-[#66b2ff]" : "text-gray-200"
      }`}
    >
      {item.label}
    </a>
  );
}
