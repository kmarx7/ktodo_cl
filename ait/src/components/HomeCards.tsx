import { CheckSquare, Lightbulb, ShoppingCart, Wallet } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { ITEM_TYPE_HAS_AMOUNT, type ItemType } from "@/types/item";
import { ITEM_TYPE_THEME } from "@/lib/theme";
import { formatCurrency } from "@/lib/parse";
import { ITEM_TYPE_TRANSLATION_KEY, formatOpenCount, useLocale, useT } from "@/lib/i18n";
import { useNav } from "@/lib/nav";

const CARDS: { type: ItemType; icon: typeof CheckSquare }[] = [
  { type: "todo", icon: CheckSquare },
  { type: "topay", icon: Wallet },
  { type: "tobuy", icon: ShoppingCart },
  { type: "tothink", icon: Lightbulb },
];

export function HomeCards() {
  const items = useItemStore((state) => state.items);
  const go = useNav((state) => state.go);
  const t = useT();
  const locale = useLocale();

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {CARDS.map(({ type, icon: Icon }) => {
        const typeItems = items.filter((item) => item.type === type);
        const openCount = typeItems.filter((item) => !item.checked).length;
        const remaining = typeItems
          .filter((item) => !item.checked)
          .reduce((sum, item) => sum + (item.amount ?? 0), 0);
        const theme = ITEM_TYPE_THEME[type];

        return (
          <button
            key={type}
            type="button"
            onClick={() => go(type)}
            className={`flex min-h-[132px] touch-manipulation flex-col justify-between rounded-3xl p-4 text-left transition-transform active:scale-[0.97] ${theme.cardBg}`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconText}`}>
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t(ITEM_TYPE_TRANSLATION_KEY[type])}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {ITEM_TYPE_HAS_AMOUNT[type] && remaining > 0
                  ? formatCurrency(remaining)
                  : formatOpenCount(openCount, locale)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
