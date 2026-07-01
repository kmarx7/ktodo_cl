interface ParsedQuickAdd {
  title: string;
  amount: number | null;
}

const AMOUNT_PATTERN = /([\d,]+)\s*원/;

export function parseQuickAdd(raw: string): ParsedQuickAdd {
  const match = raw.match(AMOUNT_PATTERN);
  if (!match) {
    return { title: raw.trim(), amount: null };
  }
  const amount = Number(match[1].replace(/,/g, ""));
  const title = (raw.slice(0, match.index) + raw.slice((match.index ?? 0) + match[0].length))
    .replace(/\s+/g, " ")
    .trim();
  return { title: title || raw.trim(), amount: Number.isFinite(amount) ? amount : null };
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
