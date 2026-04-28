const formatter = new Intl.NumberFormat('fr-CM', {
  style: 'currency',
  currency: 'XAF',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Formats an XAF integer to display string: 25000 → "25 000 FCFA"
export function formatXAF(amount: number): string {
  return formatter.format(amount)
}

// Parses a formatted XAF string back to integer: "25 000 FCFA" → 25000
export function parseXAF(formatted: string): number {
  const digits = formatted.replace(/[^\d]/g, '')
  return parseInt(digits, 10)
}
