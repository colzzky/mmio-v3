export interface Timestamp {
  seconds: number // The number of seconds
  nanoseconds: number // The number of nanoseconds
}

export interface SubCollections {
  subCollections: string[]
}

//Removes readonly
export type MutablePick<T, K extends keyof T> = {
  -readonly [P in K]: T[P]
}

export type Platforms =
  | 'Meta'
  | 'Email-Marketing'
  | 'Google-My-Business'
  | 'Whatsapp'
  | 'SMS-Marketing'
  | 'E-Commerce'
  | 'OmniChannel'
  | ''

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
export const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export type Months = (typeof months)[number]
export type Days = (typeof days)[number]

export interface OriginalTimezone {
  value: string
  abbr: string
  offset: number
  isdst: boolean
  text: string
  utc: string[]
}

export interface TransformedTimezone {
  name: string
  abr: string
  text: string
  offset: number
}
