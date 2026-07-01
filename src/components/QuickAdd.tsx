"use client";

import { useState } from "react";
import { CalendarPlus, Clock, Plus } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { parseQuickAdd } from "@/lib/parse";
import type { ItemType } from "@/types/item";

interface QuickAddProps {
  type: ItemType;
  showAmountHint: boolean;
}

export function QuickAdd({ type, showAmountHint }: QuickAddProps) {
  const addItem = useItemStore((state) => state.addItem);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const { title, amount } = parseQuickAdd(trimmed);
    addItem({
      type,
      title,
      amount: showAmountHint ? amount : null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
    });
    setText("");
    setDueDate("");
    setDueTime("");
    setShowDate(false);
    setShowTime(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 flex-col gap-2 border-t border-neutral-200 bg-white/95 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
    >
      {(showDate || showTime) && (
        <div className="flex gap-2">
          {showDate && (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-300 px-2 py-1 text-base dark:border-neutral-700 dark:bg-neutral-900"
            />
          )}
          {showTime && (
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-300 px-2 py-1 text-base dark:border-neutral-700 dark:bg-neutral-900"
            />
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowDate((v) => !v)}
          aria-label="Set date"
          className={`touch-manipulation rounded-lg p-3 ${showDate ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}
        >
          <CalendarPlus size={18} />
        </button>
        <button
          type="button"
          onClick={() => setShowTime((v) => !v)}
          aria-label="Set time (alarm)"
          className={`touch-manipulation rounded-lg p-3 ${showTime ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}
        >
          <Clock size={18} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={showAmountHint ? "e.g. Milk $5" : "Add a task"}
          className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          aria-label="Add"
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-30 dark:bg-white dark:text-neutral-900"
          disabled={!text.trim()}
        >
          <Plus size={18} />
        </button>
      </div>
    </form>
  );
}
