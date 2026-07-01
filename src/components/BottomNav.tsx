"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CheckSquare, ShoppingCart, Wallet } from "lucide-react";

const TABS = [
  { href: "/todo", label: "Todo", icon: CheckSquare },
  { href: "/tobuy", label: "To Buy", icon: ShoppingCart },
  { href: "/topay", label: "To Pay", icon: Wallet },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-2 text-xs ${
              active
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-600"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
