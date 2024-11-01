import type { SubCollections, Timestamp } from './UniTypes'

export interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}
export interface UserProfileData extends SubCollections {
  up_id: string
  uid: string
  firstName: string
  lastName: string
  contactEmail: string
  address: Address
  createdAt:string
  updatedAt:string
}
