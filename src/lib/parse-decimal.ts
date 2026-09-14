/** Parses a decimal string written by a Portuguese-Brazilian user (e.g. "1.234,56" or "1,5"). */
export function parseDecimal(value: string | null | undefined): number | null {
  if (value == null) return null;
  let cleaned = value.trim().replace(/[R$\s]/g, "");
  if (cleaned === "") return null;
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}