export interface Timestamp {
  seconds: number // The number of seconds
  nanoseconds: number // The number of nanoseconds
}

export interface SubCollections {
  subCollections: string[]
}

//Removes readonly
export type MutablePick<T, K extends keyof T> = {
  -readonly [P in K]: T[P];
};