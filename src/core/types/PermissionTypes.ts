import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.
export enum TeamRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    LEAD = 'lead',
    MEMBER = 'member',
}

export enum Access_levels {
    FULL = 'full',
    READ = 'read',
    WRITE = 'write',
    DELETE = 'delete',
}

interface CustomPermissions {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    publish: boolean;
}

// Define the structure for each permission group (e.g., ChatBotFlow, CommentAutoReply)
interface PermissionGroup {
    access: Access_levels[]; // Array of Access_levels (e.g., READ, WRITE)
    custom?: CustomPermissions; // Custom permissions (e.g., view, add, edit, delete, publish)
}

// Define the overall permissions structure
interface PermissionsStructure {
    ChatBotFlow: PermissionGroup;
    CommentAutoReply: PermissionGroup;
}


export const default_permission: PermissionsStructure = {
    ChatBotFlow: {
        access: [Access_levels.READ],
    },
    CommentAutoReply: {
        access: [Access_levels.READ],
    }
}
const admin_permission: PermissionsStructure = {
    ChatBotFlow: {
        access: [Access_levels.FULL],
    },
    CommentAutoReply: {
        access: [Access_levels.FULL],
    }
}

const custom_permission_1: PermissionsStructure = {
    ChatBotFlow: {
        access: [Access_levels.READ, Access_levels.WRITE],
        custom: {
            view: true,
            add: true,
            edit: true,
            delete: false,
            publish: false
        }
    },
    CommentAutoReply: {
        access: [Access_levels.READ],
        custom: {
            view: true,
            add: false,
            edit: false,
            delete: false,
            publish: false
        }
    }
}


const User1MemberPermission = {
    team_role: <TeamRole>TeamRole.MEMBER,
    permission: custom_permission_1
}



export interface PermissionData extends SubCollections {
    permission_id:string
    owner_uid:string
    name:string
    assignment:PermissionsStructure
    createdAt:string
    updatedAt:string
}

export const permission_data: PermissionData = {
    permission_id: '',
    owner_uid: '',
    name: 'Untitled Permission',
    assignment: default_permission,
    createdAt: '',
    updatedAt: '',
    subCollections: []
}







