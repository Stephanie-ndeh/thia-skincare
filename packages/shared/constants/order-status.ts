import type { OrderStatus, PaymentStatus } from '../types/order'

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'processing',
  'completed',
  'failed',
]

// Which statuses a given status can transition to
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
}
