import { env } from '../config/env'
import { AppError } from '../plugins/error-handler'

const NOTCHPAY_BASE = 'https://api.notchpay.co'

export async function initializePayment(payload: {
  orderId: string
  amount: number
  email: string
  phone: string
  channel: 'cm.mtn' | 'cm.orange'
  description: string
  callbackUrl: string
}): Promise<{ reference: string; payment_url: string }> {
  const res = await fetch(`${NOTCHPAY_BASE}/payments/initialize`, {
    method: 'POST',
    headers: {
      Authorization: env.NOTCHPAY_PUBLIC_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: payload.amount,
      currency: 'XAF',
      email: payload.email,
      phone: payload.phone,
      channel: payload.channel,
      description: payload.description,
      reference: payload.orderId,
      callback: payload.callbackUrl,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new AppError(502, 'NOTCHPAY_ERROR', `NotchPay initialize failed: ${text}`)
  }

  const data = (await res.json()) as {
    transaction?: { reference: string; authorization_url?: string; payment_url?: string }
  }

  const reference = data.transaction?.reference
  const payment_url = data.transaction?.authorization_url ?? data.transaction?.payment_url

  if (!reference || !payment_url) {
    throw new AppError(502, 'NOTCHPAY_ERROR', 'Invalid response from NotchPay')
  }

  return { reference, payment_url }
}

export async function verifyPayment(
  reference: string,
): Promise<{ status: string; amount: number; reference: string }> {
  const res = await fetch(`${NOTCHPAY_BASE}/payments/${reference}`, {
    headers: { Authorization: env.NOTCHPAY_PUBLIC_KEY },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new AppError(502, 'NOTCHPAY_ERROR', `NotchPay verify failed: ${text}`)
  }

  const data = (await res.json()) as {
    transaction?: { reference: string; status: string; amount: number }
  }

  const tx = data.transaction
  if (!tx) throw new AppError(502, 'NOTCHPAY_ERROR', 'Invalid verify response from NotchPay')

  return { status: tx.status, amount: tx.amount, reference: tx.reference }
}
