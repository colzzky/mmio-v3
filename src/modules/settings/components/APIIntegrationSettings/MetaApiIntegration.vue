<script setup lang="ts">
import Avatar from '@/core/components/ui/avatar/Avatar.vue'
import AvatarFallback from '@/core/components/ui/avatar/AvatarFallback.vue'
import AvatarImage from '@/core/components/ui/avatar/AvatarImage.vue'
import { Button } from '@/core/components/ui/button'
import Card from '@/core/components/ui/card/Card.vue'
import CardContent from '@/core/components/ui/card/CardContent.vue'
import CardDescription from '@/core/components/ui/card/CardDescription.vue'
import CardFooter from '@/core/components/ui/card/CardFooter.vue'
import CardHeader from '@/core/components/ui/card/CardHeader.vue'
import CardTitle from '@/core/components/ui/card/CardTitle.vue'
import Label from '@/core/components/ui/label/Label.vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import Switch from '@/core/components/ui/switch/Switch.vue'
import { toast } from '@/core/components/ui/toast'
import Toaster from '@/core/components/ui/toast/Toaster.vue'
import { type MetaAPIAccount, type PlatformApiData } from '@/core/types/AuthUserTypes'
import type { MetaPagesReturn, MetaPictureReturn } from '@/core/types/MetaTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { loadFacebookSDK } from '@/core/utils/facebook-sdk'
import { getCollection, getWhereAny, postCollection } from '@/core/utils/firebase-collections'
import generalAxiosInstance from '@/core/utils/general-axios-instance'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthStore } from '@/stores/authStore'
import { useMetaRelatedStore } from '@/stores/metaRelatedStore'
import { usePlatformAPIStore } from '@/stores/platformAPIStore'
import { onMounted, ref, watch } from 'vue'

const useAuth = useAuthStore()
const { user_auth } = useAuth
const platformApiStore = usePlatformAPIStore()
const metaRelatedStore = useMetaRelatedStore()
const { platformAPI, facebook_integration, platform_api_list } = platformApiStore
const { meta_page, meta_pages_integration: mpi, meta_pages_list } = metaRelatedStore
const componentLoad = ref<boolean>(true)
const fb_data = ref<fb.StatusResponse | null>(null)
const fb_api_load = ref<boolean>(true)
const fb_pages_load = ref<boolean>(true)
const fb_api_information = ref<MetaAPIAccount | null>(null)
const fb_platform = ref<PlatformApiData | null>(null)

//Set and populate FB_business of user logged
const set_fb_api = (metaApi: MetaAPIAccount, fbPlatform: PlatformApiData) => {
  fb_api_load.value = true
  fb_api_information.value = metaApi
  fb_platform.value = fbPlatform
  fb_api_load.value = false
}

const set_fb_pages = async (): Promise<void> => {
  fb_pages_load.value = true

  const pages = await getWhereAny(DbCollections.meta_pages, {
    whereConditions: [
      {
        fieldName: 'owner_uid',
        operator: '==',
        value: user_auth.data?.uid,
      },
    ],
  })
  meta_pages_list.data = pages.data
  fb_pages_load.value = false
}

//This will watch platform_api_list if it's loaded. When it's loaded it will fetch MetaAPI Platform of the user logged in
/**  NO LONGER NEEDED
watch(() => platform_api_list.isInitialized, async (newValue) => {
  if (newValue) {
    const platform = platform_api_list.data.find((api) => api.platform === 'Meta')
    if (platform) {
      set_fb_api(platform.client_account as MetaAPIAccount, platform)
      await set_fb_pages()
    } else {

    }
  }
  fb_api_load.value = false
  fb_pages_load.value = false
},
)
*/

async function get_meta_platform() {
  if (platform_api_list.isInitialized) {
    const platform = platform_api_list.data.find((api) => api.platform === 'Meta')
    if (platform) {
      set_fb_api(platform.client_account as MetaAPIAccount, platform)
      await set_fb_pages()
    }
    fb_api_load.value = false
    fb_pages_load.value = false
  }
}

// Handle Facebook login
const facebookLogin = async (): Promise<void> => {
  fb_api_load.value = true
  try {
    const FB = await loadFacebookSDK()
    const scopes = 'email,public_profile,pages_show_list,pages_read_engagement,pages_messaging,pages_manage_metadata';
    FB.login(
      (response: fb.StatusResponse) => {
        if (response.authResponse) {
          console.log('User logged in with Facebook:', response)
          fb_data.value = response
        } else {
          fb_data.value = null
        }
      },
      { scope: scopes },
    )
  } catch (error) {
    fb_data.value = null
  }
}
//Watch during FB logged then save it to database
watch(fb_data, async (newValue) => {
  if (newValue && fb_data.value) {
    //Add logic here and check first if it's the same facebook account with what register the firebase
    const uid = user_auth.data ? user_auth.data.uid : ''
    const existingAcount = await getCollection(DbCollections.platform_apis, {
      id: 'Meta',
      $sub_params: {
        uid
      }
    })

    if (existingAcount.status && existingAcount.data) {
      const account = existingAcount.data
      if (
        account.client_account &&
        account.client_account.client_id !== newValue.authResponse.userID
      ) {
        const FB = await loadFacebookSDK()
        FB.logout(() => {
          toast({
            title: 'Meta Login Error',
            description:
              'It seems that are logging in to an fb account that is different from your previous registered Meta account.',
            variant: 'destructive',
          })
        })
        fb_api_load.value = false
      } else {
        await populateFbApi(newValue)
      }
    } else {
      await populateFbApi(newValue)
    }
  }
})

//Populate Fb Account from firestore and fetch Exported fb Pages from firestore
const populateFbApi = async (fbLoginStatus: fb.StatusResponse) => {
  const metaApi = await facebook_integration.exchangeForUserLongLivedToken(
    fbLoginStatus.authResponse.accessToken as string,
  )
  if (metaApi) {
    //Assign the Information to load it to template
    set_fb_api(metaApi.client_account as MetaAPIAccount, metaApi)

    //Find the platform from the fetched data and replace the existing Meta Platform from the list dynamically
    const index = platform_api_list.data.findIndex((platform) => platform.platform === 'Meta')
    if (index !== -1) {
      platform_api_list.data.splice(index, 1)
    }
    platform_api_list.data.push(metaApi)

    //After setting FB account, You can now populat FB Page list
    await set_fb_pages()
    await get_fb_pages()
  }
}

const get_fb_pages = async () => {
  fb_pages_load.value = true

  if (fb_api_information.value && fb_platform.value) {
    const owner_uid = user_auth.data ? user_auth.data.uid : ''
    const fb_pages = await mpi.get_fb_pages(fb_api_information.value.accessToken)

    //Process the Facebook page
    await processFacebookPages(fb_pages, owner_uid)
  } else {
    toast({
      title: 'Meta Login Error',
      description: 'Please logged in to your FB first before exporting',
      variant: 'destructive',
    })
  }
  fb_pages_load.value = false
}

async function processFacebookPages(fb_pages: MetaPagesReturn[] | null, owner_uid: string) {
  const previous_meta_pages = [...meta_pages_list.data]
  console.log(previous_meta_pages)
  const checked_previous_meta_pages: string[] = []

  if (fb_pages && fb_pages.length !== 0) {
    for (const page of fb_pages) {
      const index_meta_page = previous_meta_pages.findIndex((mp) => mp.page_id === page.id)
      let type: 'new' | 'update' = 'new'
      if (index_meta_page !== -1) {
        type = 'update'
        meta_page.set(meta_pages_list.data[index_meta_page])
        console.log(meta_page.data)
      } else {
        type = 'new'
        meta_page.reInit()
      }
      if (meta_page.data) {
        try {
          const fetch_page_image = await generalAxiosInstance(
            `https://graph.facebook.com/v21.0/${page.id}?fields=picture&access_token=${page.access_token}`,
          )
          meta_page.data.picture = fetch_page_image.data.picture as MetaPictureReturn
        } catch (error) {
          console.log('something went wrong fetching image')
        }

        meta_page.data.owner_uid = owner_uid
        meta_page.data.page_id = page.id
        meta_page.data.access_token = page.access_token
        meta_page.data.category = page.category
        meta_page.data.name = page.name
        meta_page.data.voided = false
        await postCollection(DbCollections.meta_pages, {
          data: meta_page.data,
          idKey: 'mp_id',
        })

        if (type === 'new') {
          previous_meta_pages.push(meta_page.data)
        }
        if (type === 'update') {
          previous_meta_pages[index_meta_page] = { ...meta_page.data }
        }
        checked_previous_meta_pages.push(meta_page.data.mp_id)
      }
    }
  }
  console.log(previous_meta_pages)
  for (const mp of previous_meta_pages) {
    const check_if_processed = checked_previous_meta_pages.find((id) => id === mp.mp_id)
    console.log(check_if_processed)
    if (!check_if_processed) {
      meta_page.set(mp)
      if (meta_page.data) {
        meta_page.data.voided = true // Update the isActive property
        await postCollection(DbCollections.meta_pages, {
          data: meta_page.data,
          idKey: 'mp_id',
        })
      }
    }
  }

  meta_pages_list.data = [...previous_meta_pages]
}

const processing_isActive_switch = ref(false)

const activate_fb_page = async (meta_page_index: number) => {
  processing_isActive_switch.value = true
  const metaPage = await getCollection(DbCollections.meta_pages, {
    id:meta_pages_list.data[meta_page_index].mp_id,
  })
  if (metaPage.status && metaPage.data && !metaPage.data?.voided) {
    metaPage.data.isActive = !metaPage.data.isActive
    meta_page.set(metaPage.data)
    await postCollection(DbCollections.meta_pages, {
      data: metaPage.data,
      idKey: 'mp_id',
    })
  }
  meta_pages_list.data[meta_page_index].isActive = !meta_pages_list.data[meta_page_index].isActive
  processing_isActive_switch.value = false
}

onMounted(async () => {
  componentLoad.value = true
  componentLoad.value = false

  await get_meta_platform()
})
</script>
<template>
  <Toaster />
  <div v-if="!componentLoad">
    <div class="flex flex-col gap-x-4 gap-y-4 xl:gap-x-12 2xl:gap-x-16">
      <Card>
        <CardHeader>
          <CardTitle>Your Meta Account</CardTitle>
          <CardDescription>This is your meta account</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="!fb_api_load">
            <div v-if="fb_api_information" class="grid-gap-4">
              <div class="flex items-center space-x-4 rounded-md border p-4">
                <Avatar>
                  <AvatarImage :src="fb_api_information.picture ? fb_api_information.picture.data.url : ''"
                    alt="@radix-vue" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div class="flex flex-col gap-3">
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">
                      {{ fb_api_information.name }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      {{ fb_api_information.email }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      expires in:
                      {{ uiHelpers.computeExpirationDate(fb_api_information.expiresIn) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="flex items-center space-x-4 rounded-md border p-4">
                <div class="flex flex-col gap-3">
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">No Meta Account connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="flex flex-col gap-y-4">
              <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
              <div class="flex items-center gap-2">
                <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button v-if="!fb_api_load" @click="facebookLogin" class="w-full">
            Reauthenticate Meta
          </Button>
          <Button v-else variant="outline" size="xs" disabled class="w-full">
            <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
          </Button>
        </CardFooter>
      </Card>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-2xl font-semibold">Your Meta Pages</div>
          <Label>If you haven't find your pages please reauthenticate and check pagges you want to
            use</Label>
        </div>
        <Button v-if="!fb_pages_load" size="xs" class="text-sm" @click="get_fb_pages">
          Export FB Pages
        </Button>
        <Button v-else variant="outline" size="xs" disabled class="flex items-center gap-2">
          <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
        </Button>
      </div>
      <div v-if="!fb_pages_load">
        <div v-if="meta_pages_list.data.length">
          <Card v-for="(page, index) in meta_pages_list.data" :key="page.mp_id">
            <div class="grid-gap-4 px-4 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage :src="page.picture ? page.picture.data.url : ''" alt="@radix-vue" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div class="flex flex-col gap-3">
                    <div class="flex-1 space-y-1.5">
                      <p class="text-sm font-medium leading-none">
                        {{ page.name }}
                        <span v-if="page.voided"
                          class="ml-2 rounded-xl border border-red-500 px-3 text-red-500">Voided</span>
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{ page.category }}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{ page.page_id }}
                      </p>
                    </div>
                  </div>
                </div>

                <Switch :disabled="page.voided || processing_isActive_switch" :checked="page.isActive"
                  @update:checked="activate_fb_page(index)" />
              </div>
            </div>
          </Card>
        </div>
        <div v-else>It seems that you haven't exported your pages yet. Export now</div>
      </div>
      <div v-else>
        <Card>
          <div class="grid-gap-4 px-4 py-4">
            <div class="flex flex-col gap-y-4">
              <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
              <div class="flex items-center gap-2">
                <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
  <div v-else>Loading component</div>
</template>

<style></style>
