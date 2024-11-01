import type { Timestamp } from "firebase/firestore"
import type { SubCollections } from "./UniTypes"

export interface MetaPagesReturn {
    access_token: string,
    category: string,
    category_list: { id: string, name: string, }[],
    name: string,
    id: string,
    tasks: string[]
}

export interface MetaPictureReturn {
    data: {
        is_silhouette: boolean,
        url: string,
        width: number,
        height: number
    }
}

export interface MetaPagesData extends SubCollections {
    mp_id: string
    pa_id: string
    page_id: string
    access_token: string
    picture?: MetaPictureReturn
    category: string
    name: string
    isActive: boolean
    voided: boolean
    isOnProject: boolean
    createdAt: string
    updatedAt: string
}

/** Meta Services */

export interface ChatBotFlowData extends SubCollections{
    cb_id:string
    pj_id:string // Meta_page_id
    name:string
    dataFlow:string // This is where flow data is needed
    status:string
    isEnabled:string
    createdAt: string
    updatedAt: string
}

/** Meta Services */