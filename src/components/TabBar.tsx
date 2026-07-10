"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Settings } from "lucide-react";
import { useT, type TranslationKey } from "@/lib/i18n";

const TABS: { href: string; icon: typeof Home; labelKey: TranslationKey }[] = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
];

const TAB_ROOTS = TABS.map((tab) => tab.href);

export function TabBar() {
  const pathname = usePathname();
  const t = useT();

  if (!pathname || !TAB_ROOTS.includes(pathname)) return null;

  return (
    <nav
      style={{ viewTransitionName: "tab-bar" }}
      className="flex shrink-0 border-t border-neutral-200 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
    >
      {TABS.map(({ href, icon: Icon, labelKey }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 pt-2 ${
              active
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
