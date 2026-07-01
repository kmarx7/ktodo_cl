interface ParsedQuickAdd {
  title: string;
  amount: number | null;
}

const AMOUNT_PATTERNS = [/\$\s?([\d,]+)/, /([\d,]+)\s*won\b/i, /₩\s?([\d,]+)/];

export function parseQuickAdd(raw: string): ParsedQuickAdd {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = raw.match(pattern);
    if (!match) continue;
    const amount = Number(match[1].replace(/,/g, ""));
    if (!Number.isFinite(amount)) continue;
    const start = match.index ?? 0;
    const title = (raw.slice(0, start) + raw.slice(start + match[0].length))
      .replace(/\s+/g, " ")
      .trim();
    return { title: title || raw.trim(), amount };
  }
  return { title: raw.trim(), amount: null };
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "KRW",
});

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}
