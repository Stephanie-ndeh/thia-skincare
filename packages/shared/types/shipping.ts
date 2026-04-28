export interface ShippingZone {
  id: string
  region: string
  city: string | null    // null = default for entire region
  cost: number           // XAF integer
  createdAt: string
  updatedAt: string
}

export interface ShippingCalculation {
  region: string
  city: string
  cost: number           // XAF integer
}
