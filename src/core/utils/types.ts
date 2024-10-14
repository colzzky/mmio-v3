export interface Modal {
  isOpen: boolean
  initialState(): void
  open(): void
  close(): void
}
