import type { HeaderNavItem } from "@/content/navigation";

interface HeaderNavLinkProps {
  item: HeaderNavItem;
  isLast: boolean;
}

export default function HeaderNavLink({ item, isLast }: HeaderNavLinkProps) {
  return (
    <a
      href={item.href}
      className={`${isLast ? "" : "mr-6"} text-sm text-gray-200 transition-colors duration-300 hover:text-[#007bff]`}
    >
      {item.label}
    </a>
  );
}
