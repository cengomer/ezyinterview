import Link from "next/link";

export default function SidebarNavItem({
  label,
  href,
  icon,
  active,
  collapsed,
}: {
  label: string;
  href: string;
  icon: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium transition-colors text-base ${
        active
          ? "bg-blue-100 text-blue-600"
          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
      } ${collapsed ? "justify-center px-2" : ""}`}
      // TODO: Add navigation logic if needed
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
