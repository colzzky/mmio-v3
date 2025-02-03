//This is where we save the the thirdparty logins like facebook, omnichannel, etc
import { type MetaPageData, type MetaPagesReturn, meta_page_data } from '@/core/types/MetaTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { postCollection, getCollection } from '@/core/utils/firebase-collections'
import generalAxiosInstance from '@/core/utils/general-axios-instance'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>

interface MetaPage {
  data: MetaPageData | null
  reInit: () => void
  set: (data: MetaPageData) => void
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

type MetaPageDataReturnData = FirebaseReturnBase & {
  data: MetaPageData
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

export const useMetaRelatedStore = defineStore('metaRelatedStore', () => {
  const meta_page = reactive<MetaPage>({
    data: null,
    reInit() {
      this.data = { ...meta_page_data }
    },
    // async get(id: string) {
    //   const get = await getCollection(DbCollections.meta_pages, {
    //     $sub_params: null,
    //     id: id,
    //   })

    //   return {
    //     status: get.status,
    //     data: get.data as MetaPageData,
    //     error: get.error,
    //   }
    // },
    // async createUpdate(type) {
    //   const id = this.data?.mp_id ? this.data.mp_id : crypto.randomUUID()
    //   if (this.data) this.data.mp_id = id
    //   const post = await postCollection(DbCollections.meta_pages, {
    //     $sub_params: null,
    //     id,
    //     data: this.data,
    //     type,
    //   })
    //   console.log(post)
    //   return {
    //     status: post.status,
    //     data: post.data as MetaPageData,
    //     error: post.error,
    //   }
    // },
    //Only set after fetch
    set(data) {
      this.data = data
      return this.data
    },
  })

  const meta_pages_list = reactive({
    data: [] as MetaPageData[],
    isInitialized: false as boolean,
    isLoading: false as boolean,
    lastSnapshot: '' as string,
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
    },
  })

  return {
    meta_page,
    meta_pages_list,
    // chat_bot_flow,
    // chat_bot_flow_list,
    meta_pages_integration,
  }
})

/** 
  PlatformApis (Meta, client_info(UserAuth, Access token, expiration))
  PageCollection (MetaClient, accesstoken, page id, page name, accessToken Expiration)
*/
