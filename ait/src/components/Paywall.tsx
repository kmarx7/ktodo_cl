import { CalendarDays, Lock } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useNav } from "@/lib/nav";

/** Upsell shown in place of a premium-gated screen for free users. */
export function Paywall() {
  const go = useNav((state) => state.go);
  const t = useT();

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-8 pb-[env(safe-area-inset-bottom)] text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
        <Lock size={28} />
      </span>

      <div className="space-y-1.5">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {t("premium.title")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("premium.desc")}</p>
      </div>

      <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-neutral-300">
        <span className="flex items-center gap-2">
          <CalendarDays size={18} className="text-violet-500" />
          {t("nav.calendar")}
        </span>
      </div>

      <button
        type="button"
        onClick={() => go("iap")}
        className="mt-2 min-h-[48px] w-full max-w-xs touch-manipulation rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white active:scale-[0.98] dark:bg-white dark:text-neutral-900"
      >
        {t("premium.unlock")}
      </button>
    </div>
  );
}
