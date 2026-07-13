import { CalendarDays, Home, Settings } from "lucide-react";
import { useT, type TranslationKey } from "@/lib/i18n";
import { TAB_SCREENS, useNav, type Screen } from "@/lib/nav";

const TABS: { screen: Screen; icon: typeof Home; labelKey: TranslationKey }[] = [
  { screen: "home", icon: Home, labelKey: "nav.home" },
  { screen: "calendar", icon: CalendarDays, labelKey: "nav.calendar" },
  { screen: "settings", icon: Settings, labelKey: "nav.settings" },
];

export function TabBar() {
  const screen = useNav((state) => state.screen);
  const go = useNav((state) => state.go);
  const t = useT();

  if (!TAB_SCREENS.includes(screen)) return null;

  return (
    <nav
      style={{ viewTransitionName: "tab-bar" }}
      className="flex shrink-0 border-t border-neutral-200 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
    >
      {TABS.map(({ screen: tabScreen, icon: Icon, labelKey }) => {
        const active = screen === tabScreen;
        return (
          <button
            key={tabScreen}
            type="button"
            onClick={() => go(tabScreen)}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 pt-2 ${
              active
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
