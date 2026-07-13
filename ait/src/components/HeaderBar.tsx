import { ChevronLeft } from "lucide-react";
import { ITEM_TYPE_TRANSLATION_KEY, useT } from "@/lib/i18n";
import { ITEM_TYPES, type ItemType } from "@/types/item";
import { useNav, type Screen } from "@/lib/nav";

function isItemType(screen: Screen): screen is ItemType {
  return (ITEM_TYPES as readonly string[]).includes(screen);
}

/** Compact back header for every screen except home. */
export function HeaderBar({ screen }: { screen: Exclude<Screen, "home"> }) {
  const go = useNav((state) => state.go);
  const t = useT();

  const label = isItemType(screen)
    ? t(ITEM_TYPE_TRANSLATION_KEY[screen])
    : screen === "settings"
      ? t("settings.title")
      : screen === "iap"
        ? "" // IAP renders as a standalone screen with its own header; never shown here
        : t("nav.calendar");

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="flex shrink-0 items-center gap-2 px-2 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]"
    >
      <button
        type="button"
        onClick={() => go("home")}
        aria-label={t("nav.backHome")}
        className="touch-manipulation rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
      >
        <ChevronLeft size={22} />
      </button>
      <h1 className="text-base font-bold">{label}</h1>
    </header>
  );
}
