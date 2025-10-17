
// =============================================
// File: src/lib/format.ts
// =============================================
export const fmtCurrency = (n?: number) =>
typeof n === "number"
? n.toLocaleString(undefined, { style: "currency", currency: "USD" })
: "—";


export const fmtDate = (iso: string) =>
new Date(iso).toLocaleDateString(undefined, {
year: "numeric",
month: "short",
day: "numeric",
});