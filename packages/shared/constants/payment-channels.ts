import type { PaymentChannel } from '../types/payment'

export interface PaymentChannelInfo {
  code: PaymentChannel
  label: string
  icon: string
}

export const PAYMENT_CHANNELS: PaymentChannelInfo[] = [
  {
    code: 'cm.mtn',
    label: 'MTN Mobile Money',
    icon: 'mtn-momo',
  },
  {
    code: 'cm.orange',
    label: 'Orange Money',
    icon: 'orange-money',
  },
]
