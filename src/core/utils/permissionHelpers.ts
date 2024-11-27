import { toast } from '../components/ui/toast'
import {
    access_level_byservice,
    access_level_permissions,
    PermissionServices,
    type Access_levels,
    type AccessStructure,
    type PermissionTypes,
    type TypeOfPermissionType,
} from '../types/PermissionTypes'
import type { WorkspaceData } from './types'
import { useAuthStore } from '@/stores/authStore'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'

export class PermissionAccessError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PermissionAccessError'
    }
}

const authStore = useAuthStore()
const { user_auth } = authStore
const authWorkspaceStore = useAuthWorkspaceStore()
const { current_member, active_workspace } = authWorkspaceStore

export const servicePermission = {
    /**
     * Checks if the current member has sufficient permissions for a specific service.
     *
     * @param {PermissionServices} service - The service to check permissions for.
     * @param {TypeOfPermissionType | TypeOfPermissionType[]} permission - The permission(s) to check.
     * @returns {Promise<void | Error>} Resolves if permissions are sufficient, rejects with PermissionAccessError otherwise.
     * @throws {PermissionAccessError} Insufficient permissions.
     */
    async check(service: PermissionServices, permission: TypeOfPermissionType | TypeOfPermissionType[]): Promise<Error | void> {
        if (accessPermission.workspaceOwner(active_workspace.data)) return
        const member_access_permission = current_member.data?.accessPermissions

        if (member_access_permission && member_access_permission[service]) {
            const getCurrentPermissions = (accessLevels: Access_levels[]): TypeOfPermissionType[] => {
                return [
                    ...new Set(accessLevels.flatMap((level) => access_level_byservice[service][level] ?? [])),
                ]
            }
            const current_permission: TypeOfPermissionType[] = getCurrentPermissions(
                member_access_permission[service].access,
            )
            console.log(current_permission)
            const common_permission = Array.isArray(permission)
                ? permission.every((p) => current_permission.includes(p))
                : current_permission.includes(permission)

            if (common_permission) {
                return
            } else {
                //Check custom
                if (member_access_permission[service].custom) {
                    const current_custom_permission = member_access_permission[service].custom
                    const custom_permission = Array.isArray(permission)
                        ? permission.every((p) => current_custom_permission[p])
                        : current_custom_permission[permission]
                    if (custom_permission) return
                }
            }
        }
        toast({
            title: 'Permission Access Error',
            description: `You do not have enough permission in this Workspace to ${permission} in ${service} service.`,
            variant: 'destructive',
        })
        throw new PermissionAccessError('Insufficient permissions')
    },
}

export const accessPermission = {
    workspaceOwner(workspaceData: WorkspaceData | null): boolean {
        if (workspaceData) {
            if (user_auth.data && user_auth.data.uid === workspaceData.owner_uid) {
                return true
            }
        }

        return false
    },
}

export const rolePermission = {
    //For handling Teams
}
