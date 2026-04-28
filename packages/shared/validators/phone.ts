// Accepts: 6XXXXXXXX | +2376XXXXXXXX | 2376XXXXXXXX
const CAMEROON_PHONE_RE = /^(\+?237)?6[0-9]{8}$/

export function isValidCameroonPhone(phone: string): boolean {
  return CAMEROON_PHONE_RE.test(phone.replace(/\s/g, ''))
}

// Normalizes any accepted Cameroonian format to +237XXXXXXXXX
export function formatCameroonPhone(phone: string): string {
  const digits = phone.replace(/\s/g, '')

  if (digits.startsWith('+237')) return digits
  if (digits.startsWith('237')) return `+${digits}`
  if (digits.startsWith('6')) return `+237${digits}`

  throw new Error(`Invalid Cameroonian phone number: ${phone}`)
}
