// format a number as Indian Rupees
// example: 1500.5 → "₹1,500.50"
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

// format a date string to readable format
// guards against null, undefined, or invalid date strings from backend
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// format profit/loss with + or - sign and color class
// returns { text: "+₹500.00", colorClass: "text-green-600" }
export function formatPnL(pnl: number): { text: string; colorClass: string } {
  const text = (pnl >= 0 ? "+" : "") + formatCurrency(pnl)
  const colorClass = pnl >= 0 ? "text-green-600" : "text-red-600"
  return { text, colorClass }
}

// format a percentage
// example: 5.234 → "+5.23%"
export function formatPercent(value: number): string {
  return (value >= 0 ? "+" : "") + value.toFixed(2) + "%"
}

// truncate long text with ellipsis
// example: truncate("hello world", 8) → "hello..."
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}