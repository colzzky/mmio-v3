import type { SubCollections, MutablePick} from './UniTypes'
import type { User } from 'firebase/auth'



export interface UserAddress {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  contactEmail: string
}

export interface UserData extends SubCollections, MutablePick<User, 'displayName' | 'email' | 'photoURL' | 'uid' | 'emailVerified'> {
  uid: string
  profile: UserProfile
  address: UserAddress
  createdAt: string
  updatedAt: string
}

export const user_data: UserData = {
  uid: '',
  profile: {
    firstName: '',
    lastName: '',
    contactEmail: '',
  },
  address: {
    city: '',
    state: '',
    country: '',
    street: '',
    zipCode: '',
  },
  displayName: '',
  email: '',
  emailVerified: true,
  photoURL: '',
  subCollections: [],
  createdAt: '',
  updatedAt: ''
}

