/**
 * @type {object}
 * @property isOpen: boolean
 * @property initialState(): void
 * @property open(): void
 * @property close(): void
 */
export interface Modal {
  isOpen: boolean
  initialState(): void
  open(): void
  close(): void
}
export type { UserProfileData } from '../types/AuthUserTypes'
export type { WorkspaceData } from '../types/WorkSpaceTypes'
export type { PlatformApiData } from '../types/PlaformAPITypes'
export type { MetaPagesData } from '../types/MetaTypes'
export type { ChatBotFlowData } from '../types/MetaTypes'