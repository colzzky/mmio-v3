
//This is where we save the the thirdparty logins like facebook, omnichannel, etc
import type { MetaPagesData, MetaPagesReturn, ChatBotFlowData } from '@/core/types/MetaTypes'
import {
    postCollection,
    getCollection,
    getCollectionByField,
} from '@/core/utils/firebase-collections'
import type { FirebaseOperators, FirebaseOrderCondition, FirebaseWhereCondition } from '@/core/utils/firebase-collections'
import generalAxiosInstance from '@/core/utils/general-axios-instance'
import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useAuthStore } from './authStore'
import type { Auth } from 'firebase/auth'

type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>

interface MetaPage {
    data: MetaPagesData | null
    isInitialized: boolean
    initialize: () => void
    get: (id: string) => Promise<MetaPagesDataReturnData>
    getWhere: (where: FirebaseWhereCondition<'meta_pages'>[], limit?: number, orderBy?: FirebaseOrderCondition<'meta_pages'>[], startAfterDoc?: string) => Promise<MetaPagesDataReturnList>
    createUpdate: (type: 'new' | 'update') => Promise<MetaPagesDataReturnData>
    set: (data: MetaPagesData) => MetaPagesData
    resetData: () => void
}

interface FirebaseReturn {
    status: boolean
    data: DocumentData | undefined
    error: string
}


type MetaPagesDataReturnList = FirebaseReturnBase & {
    data: MetaPagesData[]
}
type MetaPagesDataReturnData = FirebaseReturnBase & {
    data: MetaPagesData
}


interface ChatBotFlow {
    data: ChatBotFlowData | null
    isInitialized: boolean
    initialize: () => void
    get: (id: string) => Promise<ChatBotFlowDataReturnData>
    getWhere: (where: FirebaseWhereCondition<'chat_bot_flow'>[], limit?: number, orderBy?: FirebaseOrderCondition<'chat_bot_flow'>[], startAfterDoc?: string) => Promise<ChatBotFlowDataReturnList>
    createUpdate: (type: 'new' | 'update') => Promise<ChatBotFlowDataReturnData>
    set: (data: ChatBotFlowData) => ChatBotFlowData
    resetData: () => void
}

interface FirebaseReturn {
    status: boolean
    data: DocumentData | undefined
    error: string
}

type ChatBotFlowDataReturnList = FirebaseReturnBase & {
    data: ChatBotFlowData[]
}
type ChatBotFlowDataReturnData = FirebaseReturnBase & {
    data: ChatBotFlowData
}

export const useMetaRelatedStore = defineStore('metaRelatedStore', () => {
    const meta_page = reactive<MetaPage>({
        data: null,
        isInitialized: false,
        initialize() {
            this.data = {
                mp_id: '',
                pa_id: '',
                page_id: '',
                access_token: '',
                picture: undefined,
                category: '',
                name: '',
                isActive: false,
                isOnProject: false,
                voided: false,
                createdAt: '',
                updatedAt: '',
            }
            this.isInitialized = true
        },
        async get(id: string) {
            const get = await getCollection('meta_pages', 'mp_id', id)
            return {
                status: get.status,
                data: get.data as MetaPagesData,
                error: get.error,
            }
        },
        async getWhere(where, limit, orderBy, snapshot) {
            const get = await getCollectionByField('meta_pages', 'mp_id', where, limit, orderBy, snapshot)
            return {
                status: get.status,
                data: get.data as MetaPagesData[],
                error: get.error,
            }
        },
        async createUpdate(type) {
            console.log(type)
            console.log(this.data)
            const id = type === 'new' ? crypto.randomUUID() : this.data ? this.data.mp_id : ''
            if (this.data) this.data.mp_id = id
            console.log(this.data)
            const post = await postCollection('meta_pages', 'mp_id', id, this.data, type)
            console.log(post)
            return {
                status: post.status,
                data: post.data as MetaPagesData,
                error: post.error,
            }
        },
        //Only set after fetch
        set(data) {
            this.data = data
            this.isInitialized = true
            return this.data
        },
        resetData() {
            this.data = null
            this.isInitialized = false
        }

    })

    const meta_pages_list = reactive({
        data: <MetaPagesData[]>[],
        isInitialized: <boolean>false,
        isLoading: <boolean>false,
        lastSnapshot: <any>''
    })

    const chat_bot_flow = reactive<ChatBotFlow>({
        data: null,
        isInitialized: false,
        initialize() {
            this.data = {
                cb_id: '',
                pj_id: '',
                name: '',
                dataFlow: '',
                status: 'active',
                isEnabled: 'enabled',
                createdAt: '',
                updatedAt: '',
            }
            this.isInitialized = true
        },
        async get(id: string) {
            const get = await getCollection('chat_bot_flow', 'cb_id', id)
            return {
                status: get.status,
                data: get.data as ChatBotFlowData,
                error: get.error,
            }
        },
        async getWhere(where, limit, orderBy, snapshot) {
            const get = await getCollectionByField('chat_bot_flow', 'cb_id', where, limit, orderBy, snapshot)
            return {
                status: get.status,
                data: get.data as ChatBotFlowData[],
                error: get.error,
            }
        },
        async createUpdate(type) {
            console.log(type)
            console.log(this.data)
            const id = type === 'new' ? crypto.randomUUID() : this.data ? this.data.cb_id : ''
            if (this.data) this.data.cb_id = id
            console.log(this.data)
            const post = await postCollection('chat_bot_flow', 'cb_id', id, this.data, type)
            console.log(post)
            return {
                status: post.status,
                data: post.data as ChatBotFlowData,
                error: post.error,
            }
        },
        //Only set after fetch
        set(data) {
            this.data = data
            this.isInitialized = true
            return this.data
        },
        resetData() {
            this.data = null
            this.isInitialized = false
        }
    })

    const chat_bot_flow_list = reactive({
        data: <ChatBotFlowData[]>[],
        isInitialized: <boolean>false,
        isLoading: <boolean>true,
        lastSnapshot: <any>'',
        resetData() {
            this.data = []
            this.isInitialized = false
            this.isLoading = true
            this.lastSnapshot = ''
        },
    })

    const meta_pages_integration = reactive({
        async get_fb_pages(accessToken: string): Promise<MetaPagesReturn[] | null> {
            const url = `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
            try {
                const fetch_page = await generalAxiosInstance.get(url)
                console.log(fetch_page)
                return fetch_page.data.data as MetaPagesReturn[]
            } catch (error) {
                return null
            }
        }
    })

    return {
        meta_page,
        meta_pages_list,
        chat_bot_flow,
        chat_bot_flow_list,
        meta_pages_integration
    }
})


/** 

  PlatformApis (Meta, client_info(UserAuth, Access token, expiration))
  PageCollection (MetaClient, accesstoken, page id, page name, accessToken Expiration)
*/