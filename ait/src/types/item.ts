export type ItemType = "todo" | "topay" | "tobuy" | "tothink";

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  amount: number | null;
  dueDate: string | null;
  dueTime: string | null;
  checked: boolean;
  createdAt: number;
}

export const ITEM_TYPES: ItemType[] = ["todo", "topay", "tobuy", "tothink"];

export const ITEM_TYPE_HAS_AMOUNT: Record<ItemType, boolean> = {
  todo: false,
  topay: true,
  tobuy: true,
  tothink: false,
};
