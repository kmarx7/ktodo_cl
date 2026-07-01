"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { formatCurrency } from "@/lib/parse";
import type { Item } from "@/types/item";

function formatDue(dueDate: string | null, dueTime: string | null): string | null {
  if (!dueDate) return null;
  const datePart = format(new Date(`${dueDate}T00:00`), "MMM d");
  return dueTime ? `${datePart}, ${dueTime}` : datePart;
}

function isOverdue(dueDate: string | null, dueTime: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(`${dueDate}T${dueTime ?? "23:59"}`);
  return due.getTime() < Date.now();
}

export function ItemRow({ item }: { item: Item }) {
  const toggleChecked = useItemStore((state) => state.toggleChecked);
  const deleteItem = useItemStore((state) => state.deleteItem);
  const due = formatDue(item.dueDate, item.dueTime);
  const overdue = !item.checked && isOverdue(item.dueDate, item.dueTime);

  return (
    <li className="flex items-center gap-2 border-b border-neutral-100 pl-2 pr-3 dark:border-neutral-900">
      <button
        type="button"
        onClick={() => toggleChecked(item.id)}
        aria-label={item.checked ? "Uncheck" : "Check"}
        className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center"
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            item.checked
              ? "border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {item.checked && (
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-white dark:fill-neutral-900">
              <path d="M6.5 11.5 3 8l1-1 2.5 2.5L12 4l1 1z" />
            </svg>
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1 py-3">
        <p
          className={`truncate text-sm ${
            item.checked
              ? "text-neutral-400 line-through dark:text-neutral-600"
              : "text-neutral-900 dark:text-neutral-100"
          }`}
        >
          {item.title}
        </p>
        {due && (
          <p className={`text-xs ${overdue ? "text-red-500" : "text-neutral-400"}`}>{due}</p>
        )}
      </div>

      {item.amount !== null && (
        <span
          className={`shrink-0 text-sm font-medium ${
            item.checked ? "text-neutral-300 line-through dark:text-neutral-700" : "text-neutral-700 dark:text-neutral-300"
          }`}
        >
          {formatCurrency(item.amount)}
        </span>
      )}

      <button
        type="button"
        onClick={() => deleteItem(item.id)}
        aria-label="Delete"
        className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center text-neutral-300 active:text-red-500 dark:text-neutral-700"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}
