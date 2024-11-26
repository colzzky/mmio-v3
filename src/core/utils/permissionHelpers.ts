import { useAuthStore } from "@/stores/authStore"
import type { WorkspaceData } from "./types"

const authStore = useAuthStore()
const { user_auth } = authStore

export const servicePermission = {

}

export const accessPermission = {
    workspaceOwner(workspaceData:WorkspaceData):boolean{
        if(user_auth.data && user_auth.data.uid === workspaceData.owner_uid){
            return true
        }
        return false
    }

}

export const rolePermission = {
    
}