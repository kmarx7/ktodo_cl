import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { useUiStore } from "@/lib/uiStore";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { ITEM_TYPE_HAS_AMOUNT, type Item } from "@/types/item";

const inputClass =
  "min-w-0 rounded-xl border border-neutral-300 px-4 py-2.5 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900";

/** Reads the currently-edited item from the stores and renders the sheet. */
export function EditItemSheet() {
  const editingId = useUiStore((state) => state.editingId);
  const item = useItemStore(
    (state) => state.items.find((i) => i.id === editingId) ?? null
  );

  if (!item) return null;
  // Key by id so the form's local state resets when a different item is opened.
  return <EditSheetForm key={item.id} item={item} />;
}

function EditSheetForm({ item }: { item: Item }) {
  const updateItem = useItemStore((state) => state.updateItem);
  const deleteItem = useItemStore((state) => state.deleteItem);
  const setEditingId = useUiStore((state) => state.setEditingId);
  const t = useT();

  const showAmount = ITEM_TYPE_HAS_AMOUNT[item.type];
  const [title, setTitle] = useState(item.title);
  const [amountText, setAmountText] = useState(
    item.amount != null ? String(item.amount) : ""
  );
  const [dueDate, setDueDate] = useState(item.dueDate ?? "");
  const [dueTime, setDueTime] = useState(item.dueTime ?? "");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setEditingId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    let amount = item.amount;
    if (showAmount) {
      const entered = Number(amountText.replace(/,/g, ""));
      amount = amountText.trim() && Number.isFinite(entered) ? entered : null;
    }

    const nextDate = dueDate || null;
    const nextTime = dueTime || null;
    const dueChanged = nextDate !== item.dueDate || nextTime !== item.dueTime;

    updateItem(item.id, {
      title: trimmed,
      amount,
      dueDate: nextDate,
      dueTime: nextTime,
      // Re-arm the reminder if the due date/time moved.
      ...(dueChanged ? { notified: false } : {}),
    });
    tapFeedback(10);
    setEditingId(null);
  }

  function handleDelete() {
    tapFeedback(20);
    deleteItem(item.id);
    setEditingId(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={t("edit.title")}
    >
      <button
        type="button"
        aria-label={t("edit.cancel")}
        onClick={() => setEditingId(null)}
        className="absolute inset-0 animate-[sheet-fade_150ms_ease-out] bg-black/40 motion-reduce:animate-none"
      />

      <form
        onSubmit={handleSave}
        className="relative flex animate-[sheet-up_200ms_ease-out] flex-col gap-3 rounded-t-3xl bg-white p-4 pb-[max(env(safe-area-inset-bottom),1rem)] motion-reduce:animate-none dark:bg-neutral-950"
      >
        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          {t("edit.title")}
        </h2>

        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("quickAdd.itemName")}
          className={inputClass}
        />

        {showAmount && (
          <input
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            inputMode="decimal"
            placeholder={t("quickAdd.amount")}
            className={inputClass}
          />
        )}

        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className="px-1 text-xs text-neutral-400">{t("quickAdd.date")}</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="px-1 text-xs text-neutral-400">{t("quickAdd.time")}</span>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex touch-manipulation items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-red-500 active:bg-red-50 dark:active:bg-red-950/40"
          >
            <Trash2 size={16} />
            {t("item.delete")}
          </button>
          <span className="flex-1" />
          <button
            type="submit"
            disabled={!title.trim()}
            className="touch-manipulation rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-30 dark:bg-white dark:text-neutral-900"
          >
            {t("edit.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
