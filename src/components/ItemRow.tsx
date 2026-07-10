"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { useUiStore } from "@/lib/uiStore";
import { tapFeedback } from "@/lib/haptics";
import { formatCurrency } from "@/lib/parse";
import { useLocale, useT } from "@/lib/i18n";
import type { Item } from "@/types/item";

const DELETE_WIDTH = 80;
const OPEN_THRESHOLD = DELETE_WIDTH / 2;
const COMPLETE_THRESHOLD = 60;
const DIRECTION_LOCK = 8;

function formatDue(dueDate: string | null, dueTime: string | null, locale: "en" | "ko"): string | null {
  if (!dueDate) return null;
  const datePart = format(new Date(`${dueDate}T00:00`), locale === "ko" ? "M월 d일" : "MMM d");
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
  const openRowId = useUiStore((state) => state.openRowId);
  const setOpenRow = useUiStore((state) => state.setOpenRow);
  const t = useT();
  const locale = useLocale();

  const isOpen = openRowId === item.id;
  const [dragX, setDragX] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"undecided" | "horizontal" | "vertical">("undecided");

  const due = formatDue(item.dueDate, item.dueTime, locale);
  const overdue = !item.checked && isOverdue(item.dueDate, item.dueTime);

  const restingX = isOpen ? -DELETE_WIDTH : 0;
  const offset = dragX ?? restingX;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = "undecided";
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (axis.current === "undecided") {
      if (Math.abs(dx) < DIRECTION_LOCK && Math.abs(dy) < DIRECTION_LOCK) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        axis.current = "vertical";
        start.current = null;
        return;
      }
      axis.current = "horizontal";
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const next = Math.max(-DELETE_WIDTH, Math.min(COMPLETE_THRESHOLD + 20, restingX + dx));
    setDragX(next);
  }

  function handlePointerUp() {
    if (!start.current || axis.current !== "horizontal" || dragX === null) {
      start.current = null;
      setDragX(null);
      return;
    }

    if (dragX >= COMPLETE_THRESHOLD) {
      toggleChecked(item.id);
      tapFeedback(10);
      setOpenRow(null);
    } else if (dragX <= -OPEN_THRESHOLD) {
      if (!isOpen) tapFeedback(10);
      setOpenRow(item.id);
    } else {
      setOpenRow(null);
    }

    start.current = null;
    axis.current = "undecided";
    setDragX(null);
  }

  function handleDelete() {
    tapFeedback(20);
    setOpenRow(null);
    deleteItem(item.id);
  }

  function handleCheckboxClick() {
    tapFeedback(10);
    toggleChecked(item.id);
  }

  return (
    <li className="relative overflow-hidden border-b border-neutral-100 dark:border-neutral-900">
      <div className="absolute inset-y-0 left-0 flex w-full items-center bg-emerald-500 pl-4 text-white">
        <Check size={20} />
      </div>

      <button
        type="button"
        onClick={handleDelete}
        aria-label={t("item.delete")}
        style={{ width: DELETE_WIDTH }}
        className="absolute inset-y-0 right-0 flex touch-manipulation items-center justify-center bg-red-500 text-white"
        tabIndex={isOpen ? 0 : -1}
      >
        <Trash2 size={18} />
      </button>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={() => isOpen && setOpenRow(null)}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragX === null ? "transform 200ms ease-out" : "none",
          touchAction: "pan-y",
        }}
        className="relative flex items-center gap-2 bg-white pl-2 pr-3 dark:bg-neutral-950"
      >
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={item.checked ? t("item.uncheck") : t("item.check")}
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
            className={`shrink-0 pr-1 text-sm font-medium ${
              item.checked ? "text-neutral-300 line-through dark:text-neutral-700" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {formatCurrency(item.amount)}
          </span>
        )}
      </div>
    </li>
  );
}
