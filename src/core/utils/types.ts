export interface Modal {
  isOpen: boolean
  initialState(): void
  open(): void
  close(): void
}
export type { UserProfileData } from '../types/AuthUserTypes';
export type { ProjectData } from '../types/ProjectTypes';
