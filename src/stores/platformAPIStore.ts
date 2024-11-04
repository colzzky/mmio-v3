
//This is where we save the the thirdparty logins like facebook, omnichannel, etc
import type { PlatformApiData, FBLonglivedCodeReturn, MetaAPIAccount, MetaAccount } from '@/core/types/PlaformAPITypes'
import {
  postCollection,
  getCollection,
  getCollectionByField,
} from '@/core/utils/firebase-collections'
import type {  FirebaseOrderCondition, FirebaseWhereCondition } from '@/core/utils/firebase-collections'
import generalAxiosInstance from '@/core/utils/general-axios-instance'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useAuthStore } from './authStore'

interface PlaformApi {
  data: PlatformApiData | null
  isInitialized: boolean
  initialize: () => void
  get: (id: string) => Promise<PlatformApiDataReturnData>
  getWhere: (where: FirebaseWhereCondition<'platform_api'>[], limit?: number, orderBy?: FirebaseOrderCondition<'platform_api'>[], startAfterDoc?: string) => Promise<PlatformApiDataReturnList>
  createUpdate: (type: 'new' | 'update') => Promise<PlatformApiDataReturnData>
  set: (data: PlatformApiData) => PlatformApiData
  resetData: () => void
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type PlatformApiDataReturnList = FirebaseReturnBase & {
  data: PlatformApiData[]
}
type PlatformApiDataReturnData = FirebaseReturnBase & {
  data: PlatformApiData
}

export const usePlatformAPIStore = defineStore('platformAPIStore', () => {
  const platformAPI = reactive<PlaformApi>({
    data: null,
    isInitialized: false,
    initialize() {
      this.data = {
        pa_id: '',
        uid: '',
        platform: '',
        api_account: null,
        createdAt: '',
        updatedAt: '',
      }
      this.isInitialized = true
    },
    async get(id: string) {
      const get = await getCollection('platform_api', 'pa_id', id)
      return {
        status: get.status,
        data: get.data as PlatformApiData,
        error: get.error,
      }
    },
    async getWhere(where, limit, orderBy, snapshot) {
      const get = await getCollectionByField('platform_api', 'pa_id', where, limit, orderBy, snapshot)
      return {
        status: get.status,
        data: get.data as PlatformApiData[],
        error: get.error,
      }
    },
    async createUpdate(type) {
      console.log(type)
      console.log(this.data)
      const id = type === 'new' ? crypto.randomUUID() : this.data ? this.data.pa_id : ''
      console.log(id)
      console.log(this.data)
      const post = await postCollection('platform_api', 'pa_id', id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as PlatformApiData,
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

  const platform_api_list = reactive({
    data: <PlatformApiData[]>[],
    isInitialized: <boolean>false,
    isLoading: <boolean>false,
    lastSnapshot: <any>'',
    initializeAccountApis: async () => {
      const useAuth = useAuthStore()
      const { user_auth } = useAuth
      if (user_auth.data) {
        platform_api_list.isInitialized = false
        platform_api_list.isLoading = true
        const get_platform_api = await platformAPI.getWhere([{ fieldName: 'uid', operator: '==', value: user_auth.data?.uid },], undefined, [])
        console.log(get_platform_api)
        if (get_platform_api.status) {
          if (get_platform_api.data.length > 0) {
            platform_api_list.lastSnapshot = get_platform_api.data[get_platform_api.data.length - 1].pa_id;
          }
          get_platform_api.data.forEach(api => {
            platform_api_list.data.push(api);
          });
        }
      }
      platform_api_list.isInitialized = true
      platform_api_list.isLoading = false
    }

  })

  const facebook_integration = reactive({
    //!!!!NOTE THIS SHOULD BE IN Backend. For now we put this here to test data
    //It should be also save in the firestore
    async exchangeForUserLongLivedToken(shortLivedToken: string): Promise<PlatformApiData | null> {
      interface FBTokenReturn {
        access_token: string,
        token_type: string,
        expires_in: number
      }
      interface FBClientCodeReturn {
        code: string,
      }

      const {
        APP_FACEBOOK_ID,
        APP_FACEBOOK_SECRET
      } = import.meta.env
      try {
        const response = await generalAxiosInstance.get(`https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_FACEBOOK_ID}&client_secret=${APP_FACEBOOK_SECRET}&fb_exchange_token=${shortLivedToken}`);
        const fbReturn = response.data as FBTokenReturn
        console.log(fbReturn)
        const exchangeClientCode = await generalAxiosInstance.get(`https://graph.facebook.com/v21.0/oauth/client_code?client_id=${APP_FACEBOOK_ID}&client_secret=${APP_FACEBOOK_SECRET}&access_token=${fbReturn.access_token}`);
        const clientCode = exchangeClientCode.data as FBClientCodeReturn
        const redeemClientCode = await generalAxiosInstance.get(`https://graph.facebook.com/v21.0/oauth/access_token?code=${clientCode.code}&client_id=${APP_FACEBOOK_ID}`);
        const longlived = redeemClientCode.data as FBLonglivedCodeReturn
        const updateCollection = await this.saveToFirestore(longlived)
        return updateCollection
      } catch (error) {
        console.error('Error during token exchange:', error);
      }
      return null
    },
    //Save the information here
    async saveToFirestore(fb_code: FBLonglivedCodeReturn) {
      const useAuth = useAuthStore()
      const { user_auth } = useAuth
      try {
        const get_account = await generalAxiosInstance.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fb_code.access_token}`)
        const account = get_account.data as MetaAccount
        const newExpiration = await this.computeFBExpiration()
        const new_meta_api_account = <MetaAPIAccount>{
          client_id: account.id,
          email: account.email,
          name: account.name,
          picture: account.picture ? account.picture : null,
          accessToken: fb_code.access_token,
          expiresIn: fb_code.expires_in ? fb_code.expires_in : newExpiration,
          machind_id: fb_code.machine_id
        }

        //Map meta account API Information that will be save to firestore
        const getExistingAcount = await platformAPI.getWhere([
          { fieldName: 'uid', operator: '==', value: user_auth.data?.uid },
          { fieldName: 'platform', operator: '==', value: 'META' }
        ])

        console.log(getExistingAcount)
        let type = <'new' | 'update'>'new'
        if (getExistingAcount.status) {
          type = 'update'
          platformAPI.set(getExistingAcount.data[0])
          if (platformAPI.data) {
            platformAPI.data.api_account = new_meta_api_account;
          }
        } else {
          type = 'new'
          platformAPI.initialize()
          if (platformAPI.data) {
            platformAPI.data.platform = 'META'
            platformAPI.data.uid = user_auth.data ? user_auth.data.uid : ''
            platformAPI.data.api_account = new_meta_api_account;
          }
        }

        const postPlatform = await platformAPI.createUpdate(type)
        return postPlatform.data
      } catch (error) {
        console.error('Error during token exchange:', error);
        return null
      }
    },

    async computeFBExpiration(): Promise<number> {
      // Current date
      const currentDate = new Date();

      // Add 59 days
      /** 
      const expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 59);
      */

      // Set to expire in 30mins for now
      const expirationDate = new Date(currentDate.getTime() + 30 * 60 * 1000);

      // Get expiration date as a Unix timestamp (in seconds)
      const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);

      return expirationTimestamp;
    }
  })

  return {
    platformAPI,
    platform_api_list,
    facebook_integration
  }
})


/** 

  PlatformApis (Meta, client_info(UserAuth, Access token, expiration))
  PageCollection (MetaClient, accesstoken, page id, page name, accessToken Expiration)
*/