"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronLeft } from "lucide-react";
import { ITEM_TYPE_LABEL, type ItemType } from "@/types/item";

const PATH_TYPE: Record<string, ItemType> = {
  "/todo": "todo",
  "/topay": "topay",
  "/tobuy": "tobuy",
  "/tothink": "tothink",
};

export function HeaderBar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <header className="flex shrink-0 items-center justify-between px-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <h1 className="text-base font-bold">TodoCL</h1>
        <Link
          href="/calendar"
          aria-label="Calendar"
          className="touch-manipulation rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
        >
          <CalendarDays size={20} />
        </Link>
      </header>
    );
  }

  const label = pathname && PATH_TYPE[pathname] ? ITEM_TYPE_LABEL[PATH_TYPE[pathname]] : "Calendar";

  return (
    <header className="flex shrink-0 items-center gap-2 px-2 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <Link
        href="/"
        aria-label="Back to home"
        className="touch-manipulation rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
      >
        <ChevronLeft size={22} />
      </Link>
      <h1 className="text-base font-bold">{label}</h1>
    </header>
  );
}
