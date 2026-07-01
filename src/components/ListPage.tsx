"use client";

import { useMemo } from "react";
import { useItemStore } from "@/lib/store";
import type { ItemType } from "@/types/item";
import { ItemList } from "./ItemList";
import { QuickAdd } from "./QuickAdd";
import { SummaryBar } from "./SummaryBar";

interface ListPageProps {
  type: ItemType;
  emptyLabel: string;
  showAmount: boolean;
}

export function ListPage({ type, emptyLabel, showAmount }: ListPageProps) {
  const items = useItemStore((state) => state.items);
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
      <ItemList items={filtered} emptyLabel={emptyLabel} />
      <QuickAdd type={type} showAmountHint={showAmount} />
    </div>
  );
}
