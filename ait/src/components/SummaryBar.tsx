import { formatCurrency } from "@/lib/parse";
import { useT } from "@/lib/i18n";
import type { Item } from "@/types/item";

export function SummaryBar({ items }: { items: Item[] }) {
  const t = useT();
  const total = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const remaining = items
    .filter((item) => !item.checked)
    .reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const done = total - remaining;

  return (
    <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3 text-center dark:border-neutral-900 dark:bg-neutral-900/40">
      <div>
        <p className="text-[11px] text-neutral-400">{t("summary.total")}</p>
        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {formatCurrency(total)}
        </p>
      </div>
      <div>
        <p className="text-[11px] text-neutral-400">{t("summary.done")}</p>
        <p className="text-sm font-semibold text-neutral-400 line-through">
          {formatCurrency(done)}
        </p>
      </div>
      <div>
        <p className="text-[11px] text-neutral-400">{t("summary.remaining")}</p>
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
          {formatCurrency(remaining)}
        </p>
      </div>
    </div>
  );
}
