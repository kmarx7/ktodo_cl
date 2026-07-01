"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronLeft, Settings } from "lucide-react";
import { ITEM_TYPE_TRANSLATION_KEY, useT } from "@/lib/i18n";
import type { ItemType } from "@/types/item";

const PATH_TYPE: Record<string, ItemType> = {
  "/todo": "todo",
  "/topay": "topay",
  "/tobuy": "tobuy",
  "/tothink": "tothink",
};

export function HeaderBar() {
  const pathname = usePathname();
  const t = useT();

  if (pathname === "/") {
    return (
      <header className="flex shrink-0 items-center justify-between px-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <h1 className="text-base font-bold">{t("app.name")}</h1>
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            aria-label={t("nav.settings")}
            className="touch-manipulation rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
          >
            <Settings size={20} />
          </Link>
          <Link
            href="/calendar"
            aria-label={t("nav.calendar")}
            className="touch-manipulation rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
          >
            <CalendarDays size={20} />
          </Link>
        </div>
      </header>
    );
  }

  const label =
    pathname && PATH_TYPE[pathname]
      ? t(ITEM_TYPE_TRANSLATION_KEY[PATH_TYPE[pathname]])
      : pathname === "/settings"
        ? t("settings.title")
        : t("nav.calendar");

  return (
    <header className="flex shrink-0 items-center gap-2 px-2 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <Link
        href="/"
        aria-label={t("nav.backHome")}
        className="touch-manipulation rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
      >
        <ChevronLeft size={22} />
      </Link>
      <h1 className="text-base font-bold">{label}</h1>
    </header>
  );
}
