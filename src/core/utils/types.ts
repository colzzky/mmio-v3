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
//Types
export type { UserData, PlatformApiData } from '../types/AuthUserTypes'
export type { WorkspaceData } from '../types/WorkSpaceTypes'
export type { MetaPageData } from '../types/MetaTypes'
export type { ChatBotFlowData } from '../types/MetaTypes'
export type { TeamData, TeamMembersData} from '../types/TeamTypes'
export type { InvitationData } from '../types/InvitationTypes'

export { user_data } from '../types/AuthUserTypes'
