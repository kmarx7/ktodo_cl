import { Sparkles } from "lucide-react";
import { useSettingsStore, type Locale } from "@/lib/settingsStore";
import { ITEM_TYPE_TRANSLATION_KEY, useT } from "@/lib/i18n";
import { ITEM_TYPES } from "@/types/item";
import { useNav } from "@/lib/nav";

const LANGUAGES: { locale: Locale; label: string }[] = [
  { locale: "en", label: "English" },
  { locale: "ko", label: "한국어" },
];

export function SettingsView() {
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);
  const calendarCategories = useSettingsStore((state) => state.calendarCategories);
  const toggleCalendarCategory = useSettingsStore((state) => state.toggleCalendarCategory);
  const go = useNav((state) => state.go);
  const t = useT();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 pb-[env(safe-area-inset-bottom)]">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {locale === "ko" ? "프리미엄" : "Premium"}
        </h2>
        <button
          type="button"
          onClick={() => go("iap")}
          className="flex w-full touch-manipulation items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left text-sm dark:border-neutral-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-300">
            <Sparkles size={18} />
          </span>
          <span className="flex-1 font-medium text-neutral-900 dark:text-neutral-100">
            {locale === "ko" ? "프리미엄 구매" : "Go Premium"}
          </span>
          <span className="text-neutral-300 dark:text-neutral-600">›</span>
        </button>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {t("settings.language")}
        </h2>
        <div className="flex gap-2">
          {LANGUAGES.map(({ locale: lang, label }) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLocale(lang)}
              className={`flex-1 touch-manipulation rounded-xl border px-4 py-3 text-sm font-medium ${
                locale === lang
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {t("settings.calendarCategories")}
        </h2>
        <p className="mb-2 text-xs text-neutral-400">{t("settings.calendarCategoriesHint")}</p>
        <div className="flex flex-col gap-2">
          {ITEM_TYPES.map((type) => {
            const checked = calendarCategories.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleCalendarCategory(type)}
                className="flex touch-manipulation items-center justify-between rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <span className="text-neutral-900 dark:text-neutral-100">
                  {t(ITEM_TYPE_TRANSLATION_KEY[type])}
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    checked
                      ? "border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 16 16" className="h-3 w-3 fill-white dark:fill-neutral-900">
                      <path d="M6.5 11.5 3 8l1-1 2.5 2.5L12 4l1 1z" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
