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

export interface CreateOrderRequest {
  items: Array<{
    variantId: string
    quantity: number
    unitPrice: number
  }>
  discountCode?: string
  discountAmount?: number
  shippingZoneId?: string
  shippingAmount: number
  deliveryAddress: {
    fullName: string
    phone: string
    city: string
    address: string
    region: string
  }
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

// Admin-facing types (snake_case, matching DB/API response shape)

export interface OrderListItem {
  id: string
  order_number: string
  created_at: string
  status: OrderStatus
  payment_status: PaymentStatus
  total: number
  item_count: number
  customer_name: string
  customer_phone: string
  city: string
}

export interface OrderItemDetail {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
  image_url: string | null
}

export interface OrderDetail {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  payment_channel: string | null
  payment_phone: string | null
  payment_reference: string | null
  notchpay_reference: string | null
  subtotal: number
  shipping_cost: number
  discount_amount: number
  total: number
  discount_code_id: string | null
  shipping_name: string
  shipping_phone: string
  shipping_region: string
  shipping_city: string
  shipping_address_line: string
  shipping_notes: string | null
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  items: OrderItemDetail[]
  customer: {
    full_name: string
    phone: string
    email?: string
  }
}
