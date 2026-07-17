/**
 * Formats a Rupiah price alongside its manually-set Ringgit Malaysia price.
 * Both values are set independently by the admin -- this is NOT an
 * automatic conversion.
 *
 * Example: formatDualPrice(10000, 3) -> "Rp 10.000 | RM 3"
 * If priceRm is null/undefined, only the Rupiah price is shown.
 */
export function formatDualPrice(priceRp: number, priceRm?: number | null): string {
  const rp = "Rp " + Number(priceRp).toLocaleString("id-ID");
  if (priceRm == null || priceRm === 0) return rp;
  const rm = Number(priceRm).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${rp} | RM ${rm}`;
}

export function formatRp(priceRp: number): string {
  return "Rp " + Number(priceRp).toLocaleString("id-ID");
}

export function formatRM(priceRm: number): string {
  return "RM " + Number(priceRm).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}