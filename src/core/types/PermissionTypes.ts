import type { Timestamp, SubCollections } from './UniTypes'

export enum Access_levels {
    FULL = 'full',
    READ = 'read',
    WRITE = 'write',
    DELETE = 'delete',
    CUSTOM = 'custom',
}

export enum Permission_Services {
    ChatBotFlow = 'Chatbot Flow Service',
    CommentAutoReply = 'Comment Auto Reply',
    EmailMarketing = 'Email Marketing',
}

export interface CustomPermissions {
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
export interface AccessStructure {
    ChatBotFlow?: PermissionGroup;
    CommentAutoReply?: PermissionGroup;
    EmailMarketing?:PermissionGroup
}

export interface PermissionData extends SubCollections {
    permission_id:string
    owner_uid:string
    name:string
    assignment:AccessStructure
    createdAt:string
    updatedAt:string
}

//Use when adding a member this is the custom permission
export const default_access: AccessStructure = {
    ChatBotFlow: {
        access: [Access_levels.READ],
    },
    CommentAutoReply: {
        access: [Access_levels.READ],
    }
}

//Use when setting member as the admin
export const admin_access: AccessStructure = {
    ChatBotFlow: {
        access: [Access_levels.FULL],
    },
    CommentAutoReply: {
        access: [Access_levels.FULL],
    },
    EmailMarketing: {
        access: [Access_levels.READ],
    }
}

//Use when updating cutom permission only
export const custom_access: AccessStructure = {
    ChatBotFlow: {
        access: [Access_levels.READ],
    },
    CommentAutoReply: {
        access: [Access_levels.READ],
    },
    EmailMarketing: {
        access: [Access_levels.READ],
    }
}

export const custom_permission:CustomPermissions = {
    view:false,
    add:false,
    edit:false,
    delete:false,
    publish:false,
}

export const permission_data: PermissionData = {
    permission_id: '',
    owner_uid: '',
    name: 'Untitled Permission',
    assignment: default_access,
    createdAt: '',
    updatedAt: '',
    subCollections: []
}







