export function currency(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return v.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 });
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

export function shortDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG");
}
