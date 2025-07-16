"use client";
import SidebarNavItem from "./SidebarNavItem";
import UserAvatar from "./UserAvatar";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "../../providers/AuthProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "New Analysis", href: "/analysis", icon: "📝" },
  { label: "History", href: "/history", icon: "📜" },
  { label: "Subscription", href: "/subscription", icon: "💳" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuthContext();

  // If not authenticated, show nothing (sidebar hidden)
  if (!user && !loading) return null;

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 text-gray-900 z-40 flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-64"} min-h-screen`}
    >
      <div className="flex flex-col items-center py-6 px-2">
        <button
          className="self-end mb-2 md:hidden text-gray-500 hover:text-blue-600"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <span className="text-2xl">☰</span>
          ) : (
            <span className="text-2xl">×</span>
          )}
        </button>
        {user && (
          <>
            <UserAvatar
              name={user.displayName || user.email || "User"}
              avatarUrl={user.photoURL || "/vercel.svg"}
              collapsed={collapsed}
            />
            {!collapsed && (
              <span className="mt-2 font-semibold text-base text-gray-800 truncate max-w-[140px]">
                {user.displayName || user.email}
              </span>
            )}
          </>
        )}
      </div>
      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {user && navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>
      {user && (
        <div className="mt-auto mb-6 px-4">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-red-100 text-red-600 font-semibold transition-colors"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
          >
            <span className="text-lg">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
