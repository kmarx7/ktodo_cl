import { useMemo } from "react";
import { useItemStore } from "@/lib/store";
import { ITEM_TYPE_EMPTY_KEY, useT } from "@/lib/i18n";
import type { ItemType } from "@/types/item";
import { ItemList } from "./ItemList";
import { QuickAdd } from "./QuickAdd";
import { SummaryBar } from "./SummaryBar";

interface ListPageProps {
  type: ItemType;
  showAmount: boolean;
}

export function ListPage({ type, showAmount }: ListPageProps) {
  const items = useItemStore((state) => state.items);
  const t = useT();
  const filtered = useMemo(
    () =>
      items
        .filter((item) => item.type === type)
        .sort((a, b) => {
          if (a.checked !== b.checked) return a.checked ? 1 : -1;
          return b.createdAt - a.createdAt;
        }),
    [items, type]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showAmount && <SummaryBar items={filtered} />}
      <ItemList items={filtered} emptyLabel={t(ITEM_TYPE_EMPTY_KEY[type])} />
      <QuickAdd type={type} showAmountHint={showAmount} />
    </div>
  );
}
