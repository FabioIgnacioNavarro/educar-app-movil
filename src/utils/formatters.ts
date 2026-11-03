/**
 * Formateador de moneda argentina ($ ARS)
 */
export function formatCurrency(amount: number | string): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "$ 0,00";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Formateador de fechas al estándar escolar DD/MM/AAAA
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const [year, month, day] = dateString.split("-");
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString("es-AR");
  } catch {
    return dateString;
  }
}
