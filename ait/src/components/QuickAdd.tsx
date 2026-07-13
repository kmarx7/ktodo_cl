import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Clock, Plus } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { parseQuickAdd } from "@/lib/parse";
import { useT } from "@/lib/i18n";
import { tapFeedback } from "@/lib/haptics";
import type { ItemType } from "@/types/item";

interface QuickAddProps {
  type: ItemType;
  showAmountHint: boolean;
}

export function QuickAdd({ type, showAmountHint }: QuickAddProps) {
  const addItem = useItemStore((state) => state.addItem);
  const t = useT();
  const [text, setText] = useState("");
  const [amountText, setAmountText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showDate) return;
    try {
      dateInputRef.current?.showPicker?.();
    } catch {
      // showPicker() can reject (e.g. no transient user activation); the
      // field is still visible and tappable, so this is a silent no-op.
    }
  }, [showDate]);

  useEffect(() => {
    if (!showTime) return;
    try {
      timeInputRef.current?.showPicker?.();
    } catch {
      // See the showDate effect above.
    }
  }, [showTime]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    let title = trimmed;
    let amount: number | null = null;
    if (showAmountHint) {
      const enteredAmount = Number(amountText.replace(/,/g, ""));
      if (amountText.trim() && Number.isFinite(enteredAmount)) {
        amount = enteredAmount;
      } else {
        const parsed = parseQuickAdd(trimmed);
        title = parsed.title;
        amount = parsed.amount;
      }
    }

    addItem({
      type,
      title,
      amount,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
    });
    tapFeedback(10);
    setText("");
    setAmountText("");
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
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-300 px-2 py-1 dark:border-neutral-700">
              <span className="text-xs text-neutral-400">{t("quickAdd.date")}</span>
              <input
                ref={dateInputRef}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base outline-none dark:bg-neutral-900"
              />
            </label>
          )}
          {showTime && (
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-300 px-2 py-1 dark:border-neutral-700">
              <span className="text-xs text-neutral-400">{t("quickAdd.time")}</span>
              <input
                ref={timeInputRef}
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base outline-none dark:bg-neutral-900"
              />
            </label>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={showAmountHint ? t("quickAdd.itemName") : t("quickAdd.addTask")}
          className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
        {showAmountHint && (
          <input
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            inputMode="decimal"
            placeholder={t("quickAdd.amount")}
            className="w-24 shrink-0 rounded-full border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowDate((v) => !v)}
          aria-label={t("quickAdd.setDate")}
          className={`touch-manipulation rounded-lg p-3 ${showDate ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}
        >
          <CalendarPlus size={18} />
        </button>
        <button
          type="button"
          onClick={() => setShowTime((v) => !v)}
          aria-label={t("quickAdd.setTime")}
          className={`touch-manipulation rounded-lg p-3 ${showTime ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}
        >
          <Clock size={18} />
        </button>
        <span className="flex-1" />
        <button
          type="submit"
          aria-label={t("quickAdd.add")}
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-30 dark:bg-white dark:text-neutral-900"
          disabled={!text.trim()}
        >
          <Plus size={18} />
        </button>
      </div>
    </form>
  );
}
