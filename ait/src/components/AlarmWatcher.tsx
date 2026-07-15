import { useEffect } from "react";
import { useItemStore } from "@/lib/store";
import { usePremiumStore } from "@/lib/premiumStore";
import { MONETIZATION_ENABLED } from "@/lib/features";
import { notify, playBeep } from "@/lib/alarm";
import { ITEM_TYPE_TRANSLATION_KEY, translate, useLocale } from "@/lib/i18n";

const CHECK_INTERVAL_MS = 15_000;
const STALE_THRESHOLD_MS = 5 * 60_000;

export function AlarmWatcher() {
  const items = useItemStore((state) => state.items);
  const markNotified = useItemStore((state) => state.markNotified);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const locale = useLocale();

  useEffect(() => {
    // Due-date reminders are a premium feature when monetization is on.
    if (MONETIZATION_ENABLED && !isPremium) return;

    const tick = () => {
      const now = Date.now();
      for (const item of items) {
        if (item.checked || item.notified || !item.dueDate || !item.dueTime) continue;
        const dueAt = new Date(`${item.dueDate}T${item.dueTime}`).getTime();
        if (dueAt <= now && now - dueAt < STALE_THRESHOLD_MS) {
          markNotified(item.id);
          playBeep();
          const label = translate(locale, ITEM_TYPE_TRANSLATION_KEY[item.type]);
          notify(`${label} ${translate(locale, "alarm.reminder")}`, item.title);
        }
      }
    };

    const id = setInterval(tick, CHECK_INTERVAL_MS);
    tick();
    return () => clearInterval(id);
  }, [items, markNotified, locale, isPremium]);

  return null;
}
