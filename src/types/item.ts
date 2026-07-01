export type ItemType = "todo" | "topay" | "tobuy" | "tothink";

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

export const ITEM_TYPES: ItemType[] = ["todo", "topay", "tobuy", "tothink"];

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  todo: "To Do",
  topay: "To Pay",
  tobuy: "To Buy",
  tothink: "To Think",
};

export const ITEM_TYPE_HAS_AMOUNT: Record<ItemType, boolean> = {
  todo: false,
  topay: true,
  tobuy: true,
  tothink: false,
};
