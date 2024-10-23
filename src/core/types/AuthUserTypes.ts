import type { Timestamp } from './UniTypes'

export interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}
export interface UserProfileData {
  up_id: string
  uid: string
  firstName: string
  lastName: string
  contactEmail: string
  address: Address
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}
