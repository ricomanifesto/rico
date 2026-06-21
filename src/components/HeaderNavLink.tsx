import type { HeaderNavItem } from "@/content/navigation";

interface HeaderNavLinkProps {
  item: HeaderNavItem;
  isLast: boolean;
}

export default function HeaderNavLink({ item, isLast }: HeaderNavLinkProps) {
  return (
    <a
      href={item.href}
      className={`${isLast ? "" : "mr-6"} text-sm text-gray-200 transition duration-300`}
      onMouseEnter={(event) => (event.currentTarget.style.color = "#007bff")}
      onMouseLeave={(event) => (event.currentTarget.style.color = "")}
    >
      {item.label}
    </a>
  );
}
