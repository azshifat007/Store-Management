"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingCart,
  Users,
  MoreHorizontal,
  ChevronUp,
  Settings,
  Tags,
  Truck,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Role } from "@prisma/client";

const mainNav: { href: string; label: string; icon: React.ElementType; roles?: Role[] }[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/purchases", label: "Purchases", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
];

const moreNav: { href: string; label: string; icon: React.ElementType; roles?: Role[] }[] = [
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/expenses", label: "Expenses", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings, roles: [Role.OWNER] },
];

export default function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-1 border-t border-zinc-200 bg-white px-2 pb-1 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        {mainNav.map((item) => {
          if (item.roles && !item.roles.includes(role)) return null;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
              open ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={1.5} />
            <span>More</span>
          </button>
          {open && (
            <div className="absolute bottom-full left-1/2 mb-2 w-40 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-1 flex justify-end px-2">
                <ChevronUp size={14} className="text-zinc-400" />
              </div>
              {moreNav.map((item) => {
                if (item.roles && !item.roles.includes(role)) return null;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-zinc-200 pt-1 dark:border-zinc-800">
                <form action={logoutAction} className="px-2">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-1 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="hidden h-16 md:hidden" />
    </>
  );
}
