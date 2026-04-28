export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string
  productName: string   // snapshot at purchase time
  variantLabel: string  // snapshot: "50ml / Rose"
  quantity: number
  unitPrice: number     // XAF integer, snapshot
  lineTotal: number     // XAF integer
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string | null
  guestEmail: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentChannel: string | null
  paymentPhone: string | null
  paymentReference: string | null
  notchpayReference: string | null
  subtotal: number       // XAF integer
  shippingCost: number   // XAF integer
  discountAmount: number // XAF integer
  total: number          // XAF integer
  discountCodeId: string | null
  shippingName: string
  shippingPhone: string
  shippingRegion: string
  shippingCity: string
  shippingAddressLine: string
  shippingNotes: string | null
  confirmedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface CreateOrderPayload {
  shippingAddress: {
    fullName: string
    phone: string
    region: string
    city: string
    addressLine: string
    notes?: string
  }
  paymentChannel: 'cm.mtn' | 'cm.orange'
  paymentPhone: string
  discountCode?: string
}
