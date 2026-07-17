import type { Item } from "@/types/item";
import { ItemRow } from "./ItemRow";

export function ItemList({ items, emptyLabel }: { items: Item[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-neutral-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </ul>
  );
}
