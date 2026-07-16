import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAnniversaryStore } from "@/lib/anniversaryStore";
import { useUiStore } from "@/lib/uiStore";
import { tapFeedback } from "@/lib/haptics";
import { useLocale, useT, type TranslationKey } from "@/lib/i18n";
import {
  ANNIVERSARY_EMOJI,
  ANNIVERSARY_KINDS,
  type Anniversary,
  type AnniversaryKind,
  type CalKind,
} from "@/types/anniversary";

const KIND_LABEL_KEY: Record<AnniversaryKind, TranslationKey> = {
  birthday: "kind.birthday",
  anniversary: "kind.anniversary",
  memorial: "kind.memorial",
  etc: "kind.etc",
};

const selectClass =
  "min-w-0 flex-1 rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900";

export function AnniversaryEditSheet() {
  const editingId = useUiStore((state) => state.editingAnniversaryId);
  const existing = useAnniversaryStore((state) =>
    editingId && editingId !== "new"
      ? state.items.find((a) => a.id === editingId) ?? null
      : null
  );

  if (!editingId) return null;
  if (editingId !== "new" && !existing) return null;
  return <Form key={editingId} existing={existing} />;
}

function Form({ existing }: { existing: Anniversary | null }) {
  const addAnniversary = useAnniversaryStore((state) => state.addAnniversary);
  const updateAnniversary = useAnniversaryStore((state) => state.updateAnniversary);
  const removeAnniversary = useAnniversaryStore((state) => state.removeAnniversary);
  const setEditingAnniversaryId = useUiStore((state) => state.setEditingAnniversaryId);
  const t = useT();
  const locale = useLocale();
  const now = new Date();

  const [title, setTitle] = useState(existing?.title ?? "");
  const [kind, setKind] = useState<AnniversaryKind>(existing?.kind ?? "birthday");
  const [calendar, setCalendar] = useState<CalKind>(existing?.calendar ?? "solar");
  const [month, setMonth] = useState(existing?.month ?? now.getMonth() + 1);
  const [day, setDay] = useState(existing?.day ?? now.getDate());
  const [recurring, setRecurring] = useState(existing?.recurring ?? true);
  const [year, setYear] = useState(existing?.year ?? now.getFullYear());
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingAnniversaryId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setEditingAnniversaryId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const payload = {
      title: trimmed,
      kind,
      calendar,
      month,
      day,
      recurring,
      year: recurring ? null : year,
    };
    if (existing) updateAnniversary(existing.id, payload);
    else addAnniversary(payload);
    tapFeedback(10);
    setEditingAnniversaryId(null);
  }

  function handleDelete() {
    if (!existing) return;
    tapFeedback(20);
    removeAnniversary(existing.id);
    setEditingAnniversaryId(null);
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 121 }, (_, i) => now.getFullYear() - 100 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={t("remember.title")}
    >
      <button
        type="button"
        aria-label={t("edit.cancel")}
        onClick={() => setEditingAnniversaryId(null)}
        className="absolute inset-0 animate-[sheet-fade_150ms_ease-out] bg-black/40 motion-reduce:animate-none"
      />
      <form
        onSubmit={handleSave}
        className="relative flex animate-[sheet-up_200ms_ease-out] flex-col gap-3 rounded-t-3xl bg-white p-4 pb-[max(env(safe-area-inset-bottom),1rem)] motion-reduce:animate-none dark:bg-neutral-950"
      >
        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          {t("remember.title")}
        </h2>

        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("anniv.name")}
          className="rounded-xl border border-neutral-300 px-4 py-2.5 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
        />

        <div>
          <p className="mb-1.5 px-1 text-xs font-medium text-neutral-400">{t("anniv.kind")}</p>
          <div className="flex flex-wrap gap-2">
            {ANNIVERSARY_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex touch-manipulation items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${
                  kind === k
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
                }`}
              >
                <span>{ANNIVERSARY_EMOJI[k]}</span>
                {t(KIND_LABEL_KEY[k])}
              </button>
            ))}
          </div>
        </div>

        <Segmented
          label={t("anniv.calendar")}
          value={calendar}
          options={[
            { value: "solar", label: t("anniv.solar") },
            { value: "lunar", label: t("anniv.lunar") },
          ]}
          onChange={setCalendar}
        />

        <div>
          <p className="mb-1.5 px-1 text-xs font-medium text-neutral-400">{t("anniv.date")}</p>
          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={selectClass}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {locale === "ko" ? `${m}월` : m}
                </option>
              ))}
            </select>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className={selectClass}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {locale === "ko" ? `${d}일` : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Segmented
          label={t("anniv.repeat")}
          value={recurring ? "yearly" : "once"}
          options={[
            { value: "yearly", label: t("anniv.yearly") },
            { value: "once", label: t("anniv.once") },
          ]}
          onChange={(v) => setRecurring(v === "yearly")}
        />

        {!recurring && (
          <div>
            <p className="mb-1.5 px-1 text-xs font-medium text-neutral-400">{t("anniv.year")}</p>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={selectClass}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {locale === "ko" ? `${y}년` : y}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-1 flex items-center gap-2">
          {existing && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex touch-manipulation items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-red-500 active:bg-red-50 dark:active:bg-red-950/40"
            >
              <Trash2 size={16} />
              {t("item.delete")}
            </button>
          )}
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

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 px-1 text-xs font-medium text-neutral-400">{label}</p>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 touch-manipulation rounded-xl border px-4 py-2.5 text-sm font-medium ${
              value === o.value
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-200 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
