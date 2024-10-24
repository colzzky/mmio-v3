import type { Timestamp } from "firebase/firestore"

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

export interface MetaPagesData {
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
    createdAt: Timestamp | string
    updatedAt: Timestamp | string
}