"use client";

import Link from "next/link";
import { CheckSquare, Lightbulb, ShoppingCart, Wallet } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { ITEM_TYPE_LABEL, ITEM_TYPE_HAS_AMOUNT, type ItemType } from "@/types/item";
import { ITEM_TYPE_THEME } from "@/lib/theme";
import { formatCurrency } from "@/lib/parse";

const CARDS: { type: ItemType; href: string; icon: typeof CheckSquare }[] = [
  { type: "todo", href: "/todo", icon: CheckSquare },
  { type: "topay", href: "/topay", icon: Wallet },
  { type: "tobuy", href: "/tobuy", icon: ShoppingCart },
  { type: "tothink", href: "/tothink", icon: Lightbulb },
];

export function HomeCards() {
  const items = useItemStore((state) => state.items);

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {CARDS.map(({ type, href, icon: Icon }) => {
        const typeItems = items.filter((item) => item.type === type);
        const openCount = typeItems.filter((item) => !item.checked).length;
        const remaining = typeItems
          .filter((item) => !item.checked)
          .reduce((sum, item) => sum + (item.amount ?? 0), 0);
        const theme = ITEM_TYPE_THEME[type];

        return (
          <Link
            key={type}
            href={href}
            className={`flex min-h-[132px] touch-manipulation flex-col justify-between rounded-3xl p-4 active:scale-[0.97] transition-transform ${theme.cardBg}`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconText}`}>
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {ITEM_TYPE_LABEL[type]}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {ITEM_TYPE_HAS_AMOUNT[type] && remaining > 0
                  ? formatCurrency(remaining)
                  : `${openCount} open`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
