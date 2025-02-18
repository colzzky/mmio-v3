import { useAuthStore } from './authStore'
import {
  platform_api_data,
  type FBLonglivedCodeReturn,
  type MetaAccount,
  type MetaAPIAccount,
  type PlatformApiData,
} from '@/core/types/AuthUserTypes'
import type { Platforms } from '@/core/types/UniTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { postCollection, getCollection, getCollectionWithSubcollections } from '@/core/utils/firebase-collections'
import generalAxiosInstance from '@/core/utils/general-axios-instance'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

interface PlaformApi {
  data: PlatformApiData | null
  isInitialized: boolean
  initialize: () => void
  set: (data: PlatformApiData) => void
  resetData: () => void
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type PlatformApiDataReturnData = FirebaseReturnBase & {
  data: PlatformApiData
}

export const usePlatformAPIStore = defineStore('platformAPIStore', () => {
  const platformAPI = reactive<PlaformApi>({
    data: null,
    isInitialized: false,
    initialize() {
      this.data = { ...platform_api_data }
      this.isInitialized = true
    },
    // async get(uid: string, platform: Platforms) {
    //   const get = await getCollection(DbCollections.platform_apis, {
    //     $sub_params: { uid },
    //     id: platform,
    //   })
    //   return {
    //     status: get.status,
    //     data: get.data as PlatformApiData,
    //     error: get.error,
    //   }
    // },
    // async createUpdate(uid: string, type) {
    //   const post = await postCollection(DbCollections.platform_apis, {
    //     $sub_params: { uid },
    //     idKey:'platform',
    //     data: this.data,
    //     type,
    //   })

    //   return {
    //     status: post.status,
    //     data: post.data as PlatformApiData,
    //     error: post.error,
    //   }
    // },
    //Only set after fetch
    set(data) {
      this.data = data
      this.isInitialized = true
      return this.data
    },
    resetData() {
      this.data = null
      this.isInitialized = false
    },
  })

  const platform_api_list = reactive({
    data: [] as PlatformApiData[],
    isInitialized: false as boolean,
    isLoading: false as boolean,
    lastSnapshot: '' as string,
    async initializeAccountApis(): Promise<void> {
      const useAuth = useAuthStore()
      const { user_auth, user } = useAuth
      platform_api_list.isInitialized = false
      platform_api_list.isLoading = true
      if (user_auth.data && user.data && user.references && user.references.platform_apis) {
        platform_api_list.data = user.references.platform_apis
      }
      platform_api_list.isInitialized = true
      platform_api_list.isLoading = false
    },
  })

  const facebook_integration = reactive({
    //!!!!NOTE THIS SHOULD BE IN Backend. For now we put this here to test data
    //It should be also save in the firestore
    async exchangeForUserLongLivedToken(shortLivedToken: string): Promise<PlatformApiData | null | undefined> {
      interface FBTokenReturn {
        access_token: string
        token_type: string
        expires_in: number
      }
      interface FBClientCodeReturn {
        code: string
      }

      const { APP_FACEBOOK_ID, APP_FACEBOOK_SECRET } = import.meta.env
      try {
        const response = await generalAxiosInstance.get(
          `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_FACEBOOK_ID}&client_secret=${APP_FACEBOOK_SECRET}&fb_exchange_token=${shortLivedToken}`,
        )
        const fbReturn = response.data as FBTokenReturn
        console.log(fbReturn)
        const exchangeClientCode = await generalAxiosInstance.get(
          `https://graph.facebook.com/v21.0/oauth/client_code?client_id=${APP_FACEBOOK_ID}&client_secret=${APP_FACEBOOK_SECRET}&access_token=${fbReturn.access_token}`,
        )
        const clientCode = exchangeClientCode.data as FBClientCodeReturn
        const redeemClientCode = await generalAxiosInstance.get(
          `https://graph.facebook.com/v21.0/oauth/access_token?code=${clientCode.code}&client_id=${APP_FACEBOOK_ID}`,
        )
        const longlived = redeemClientCode.data as FBLonglivedCodeReturn
        const updateCollection = await this.saveToFirestore(longlived)
        return updateCollection
      } catch (error) {
        console.error('Error during token exchange:', error)
      }
      return null
    },
    //Save the information here
    async saveToFirestore(fb_code: FBLonglivedCodeReturn) {
      const useAuth = useAuthStore()
      const { user_auth } = useAuth
      const uid = user_auth.data ? user_auth.data.uid : ''
      try {
        const get_account = await generalAxiosInstance.get(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fb_code.access_token}`,
        )
        const account = get_account.data as MetaAccount
        const newExpiration = await this.computeFBExpiration()
        const new_meta_api_account: MetaAPIAccount = {
          client_id: account.id,
          email: account.email,
          name: account.name,
          picture: account.picture ? account.picture : undefined,
          accessToken: fb_code.access_token,
          expiresIn: fb_code.expires_in ? fb_code.expires_in : newExpiration,
          machind_id: fb_code.machine_id,
        }

        //Map meta account API Information that will be save to firestore
        const getExistingAcount =  await getCollection(DbCollections.platform_apis, {
              $sub_params: { uid },
              id: 'Meta',
            })
        if (getExistingAcount.status && getExistingAcount.data) {
          platformAPI.set(getExistingAcount.data)
        } else {
          platformAPI.initialize()
        }

        if (platformAPI.data) {
          platformAPI.data.platform = 'Meta'
          platformAPI.data.client_account = new_meta_api_account
          const postPlatform = await postCollection(DbCollections.platform_apis,{
            data:platformAPI.data,
            idKey:'platform',
            $sub_params:{uid},
          })

          if(postPlatform.data && postPlatform.status){
            return postPlatform.data
          }else{
            console.error('Something went wrong:')
            return null
          }
        }
      } catch (error) {
        console.error('Error during token exchange:', error)
        return null
      }
    },

    async computeFBExpiration(): Promise<number> {
      // Current date
      const currentDate = new Date()

      // Add 59 days

      const expirationDate = new Date(currentDate)
      expirationDate.setDate(currentDate.getDate() + 59)

      // Set to expire in 30mins for now
      //const expirationDate = new Date(currentDate.getTime() + 30 * 60 * 1000);

      // Get expiration date as a Unix timestamp (in seconds)
      const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000)

      return expirationTimestamp
    },
  })

  return {
    platformAPI,
    platform_api_list,
    facebook_integration,
  }
})

/** 

  PlatformApis (Meta, client_info(UserAuth, Access token, expiration))
  PageCollection (MetaClient, accesstoken, page id, page name, accessToken Expiration)
*/
