import { useAuthStore } from "@/stores/authStore"
import type {WorkspaceData } from "./types"
import { useAuthWorkspaceStore } from "@/stores/authWorkspaceStore";
import { access_level_permissions, Permission_Services, type Access_levels, type AccessStructure, type PermissionTypes } from "../types/PermissionTypes";
import { toast } from "../components/ui/toast";

export class PermissionAccessError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermissionAccessError';
    }
}

const authStore = useAuthStore()
const { user_auth } = authStore
const authWorkspaceStore = useAuthWorkspaceStore()
const { current_member, active_workspace } = authWorkspaceStore

export const servicePermission = {
    async check(service: keyof AccessStructure, permission: typeof PermissionTypes[number]): Promise<Error | void> {
        if (accessPermission.workspaceOwner(active_workspace.data)) return;
        const member_access_permission = current_member.data?.accessPermissions

        if (member_access_permission && member_access_permission[service]) {
            const getCurrentPermissions = (accessLevels: Access_levels[]): typeof PermissionTypes[number][] => {
                return [...new Set(accessLevels.flatMap((level) => access_level_permissions[level]))];
            };
            const current_permission: typeof PermissionTypes[number][] = getCurrentPermissions(member_access_permission[service].access)
            const common_permission = current_permission.includes(permission);
            if (common_permission) {
                return;
            } else {
                //Check custom
                if (member_access_permission[service].custom) {
                    const custom_permission = member_access_permission[service].custom[permission];
                    if (custom_permission) return;
                }
            }
        }
        toast({
            title: 'Permission Access Error',
            description: `You do not have enough permission in this Workspace to ${permission} in ${Permission_Services[service]} service.`,
            variant: 'destructive',
        })
        throw new PermissionAccessError('Insufficient permissions');
    }
}


export const accessPermission = {
    workspaceOwner(workspaceData: WorkspaceData | null): boolean {
        if (workspaceData) {
            if (user_auth.data && user_auth.data.uid === workspaceData.owner_uid) {
                return true
            }
        }

        return false
    }

}

export const rolePermission = {

}