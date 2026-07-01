export type ItemType = "todo" | "tobuy" | "topay";

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  amount: number | null;
  dueDate: string | null;
  dueTime: string | null;
  checked: boolean;
  notified: boolean;
  createdAt: number;
}

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  todo: "Todo",
  tobuy: "To Buy",
  topay: "To Pay",
};
