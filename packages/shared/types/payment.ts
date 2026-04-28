export type PaymentChannel = 'cm.mtn' | 'cm.orange'

export interface PaymentInitPayload {
  amount: number          // XAF integer
  currency: 'XAF'
  customer: {
    name: string
    email: string
    phone: string
  }
  description: string
  reference: string       // order number
  metadata: {
    orderId: string
  }
}

export interface NotchPayTransaction {
  reference: string
  status: string
  authorizationUrl: string
}

export interface NotchPayResponse {
  transaction: NotchPayTransaction
}

export interface PaymentWebhookPayload {
  event: string
  data: {
    reference: string
    status: string
    amount: number
    currency: string
    fee: number
    [key: string]: unknown
  }
}
