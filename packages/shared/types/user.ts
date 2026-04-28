export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  fullName: string
  phone: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  fullName: string
  phone: string
  region: string
  city: string
  addressLine: string
  notes: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}
