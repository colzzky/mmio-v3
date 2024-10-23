<script setup lang="ts">
import SettingsLayout from '@/core/layouts/SettingsLayout.vue';
import { loadFacebookSDK } from '@/core/utils/facebook-sdk';
import { Button } from '@/core/components/ui/button'
import { onMounted, ref, watch } from 'vue';
import generalAxiosInstance from '@/core/utils/general-axios-instance';
import { useAuthStore } from '@/stores/authStore';
import { usePlatformAPIStore } from '@/stores/platformAPIStore';
import type { FBLonglivedCodeReturn, MetaAPIAccount, PlatformApiData } from '@/core/types/PlaformAPITypes'
import { uiHelpers } from '@/core/utils/ui-helper';
import type { Timestamp } from 'firebase/firestore';
import Card from '@/core/components/ui/card/Card.vue';
import CardHeader from '@/core/components/ui/card/CardHeader.vue';
import CardTitle from '@/core/components/ui/card/CardTitle.vue';
import CardDescription from '@/core/components/ui/card/CardDescription.vue';
import CardContent from '@/core/components/ui/card/CardContent.vue';
import CardFooter from '@/core/components/ui/card/CardFooter.vue';
import Avatar from '@/core/components/ui/avatar/Avatar.vue';
import AvatarImage from '@/core/components/ui/avatar/AvatarImage.vue';
import AvatarFallback from '@/core/components/ui/avatar/AvatarFallback.vue';
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue';
import { useMetaRelatedStore } from '@/stores/metaRelatedStore';
import type { MetaPagesReturn } from '@/core/types/MetaTypes';
const useAuth = useAuthStore()
const platformApiStore = usePlatformAPIStore()
const metaRelatedStore = useMetaRelatedStore()
const { platformAPI, facebook_integration, platform_api_list } = platformApiStore
const { meta_page, meta_pages_integration: mpi, meta_pages_list } = metaRelatedStore
const { user_auth } = useAuth
const pageLoad = ref<boolean>(true)

const fb_data = ref<fb.StatusResponse | null>(null)
const fb_llt = ref<FBLonglivedCodeReturn | null>(null) // Long lived token

const fb_api_load = ref<boolean>(false)
const fb_api_information = ref<MetaAPIAccount | null>(null)
const fb_platform = ref<PlatformApiData | null>(null)


// Handle Facebook login
const facebookLogin = async (): Promise<void> => {
    fb_api_load.value = true
    try {
        const FB = await loadFacebookSDK();
        const scopes = 'email,public_profile,pages_show_list,pages_read_engagement'; // Add page permissions here
        FB.login((response: fb.StatusResponse) => {
            if (response.authResponse) {
                console.log('User logged in with Facebook:', response);
                fb_data.value = response
            } else {
                console.error('User cancelled login or did not fully authorize.');
                fb_data.value = null
            }
        }, { scope: scopes });
    } catch (error) {
        console.error('Error loading Facebook SDK:', error);
        fb_data.value = null
    }
};
//Watch during FB logged then save it to database
watch(fb_data, async (newValue, oldValue) => {
    if (newValue && fb_data.value) {
        console.log(fb_data.value?.authResponse.accessToken)
        const metaApi = await facebook_integration.exchangeForUserLongLivedToken(fb_data.value.authResponse.accessToken as string);
        if (metaApi) {
            set_fb_api(metaApi.api_account as MetaAPIAccount, metaApi)
        }
    }
});
const load_account_apis = async () => {
    platform_api_list.isLoading = true
    const get_platform_api = await platformAPI.getWhere([{ fieldName: 'uid', operator: '==', value: user_auth.data?.uid },], undefined, [])
    if (get_platform_api.status) {
        if (get_platform_api.data.length > 0) {
            platform_api_list.lastSnapshot = get_platform_api.data[get_platform_api.data.length - 1].pa_id;
        }
        get_platform_api.data.forEach(api => {
            platform_api_list.data.push({
                pa_id: api.pa_id,
                uid: api.uid,
                platform: api.platform,
                api_account: api.api_account,
                createdAt: uiHelpers.timestampToDateTimeAgo(api.createdAt as Timestamp),
                updatedAt: uiHelpers.timestampToDateTimeAgo(api.updatedAt as Timestamp),
            });
            if (api.platform === 'META') {
                set_fb_api(api.api_account as MetaAPIAccount, api)
            }
        });

    }
    platform_api_list.isLoading = false
};

onMounted(async () => {
    await load_account_apis()
})


const set_fb_api = (metaApi: MetaAPIAccount, fbPlatform:PlatformApiData) => {
    fb_api_load.value = true
    fb_api_information.value = metaApi
    fb_platform.value = fbPlatform
    //Add options here to fetch all pages
    fb_api_load.value = false
}

const get_fb_pages = async () => {
    if (fb_api_information.value && fb_platform.value) {
        const fb_platform_id = fb_platform.value.pa_id
        const fb_pages = await mpi.get_fb_pages(fb_api_information.value.accessToken)
        if (fb_pages && fb_pages.length !== 0) {
            await processFacebookPages(fb_pages, fb_platform_id)
        }
    }
}

async function processFacebookPages(fb_pages:MetaPagesReturn[], platform_id:string) {
    for (const page of fb_pages) {
        meta_page.initialize();
        if (meta_page.data) {
            meta_page.data.pa_id = platform_id;
            meta_page.data.page_id = page.id;
            meta_page.data.access_token = page.access_token;
            meta_page.data.category = page.category;
            meta_page.data.name = page.name;
            await meta_page.createUpdate("new");
        }
    }
}

// const fetch_current_pages = () =>{

// }



//Setp by step process
//Login with a facebook account
//Once logged in save fb id and information to firstore (With this we can validate if the user is logging in with a different account)
//When logged in it will return the pages/account you want to import
//Then save these pages
//When the user need to import more he/she needs to sign in with the same fb id or user information he used before

</script>
<template>
    <SettingsLayout>
        <main class="grid grid-cols-[minmax(350px,1fr)_1fr] gap-x-4 xl:gap-x-12 2xl:gap-x-16">
            <div>
                <div v-if='!platform_api_list.isLoading'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Meta Account</CardTitle>
                            <CardDescription>This is your meta account</CardDescription>
                        </CardHeader>
                        <CardContent>

                            <div v-if="!fb_api_load">
                                <div v-if="fb_api_information" class="grid-gap-4">
                                    <div class=" flex items-center space-x-4 rounded-md border p-4">
                                        <Avatar>
                                            <AvatarImage
                                                :src="fb_api_information.picture ? fb_api_information.picture.data.url : ''"
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
                                                    expires in: {{
                                                        uiHelpers.computeExpirationDate(fb_api_information.expiresIn) }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class=" flex items-center space-x-4 rounded-md border p-4">
                                        <div class="flex flex-col gap-3">
                                            <div class="flex-1 space-y-1">
                                                <p class="text-sm font-medium leading-none">
                                                    No Meta Account connected
                                                </p>
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
                </div>
                <div v-else>Loading all Accounts Connected API</div>
            </div>
            <div>
                <Button class="w-full" @click="get_fb_pages()">
                    Fetch all pages
                </Button>
            </div>
        </main>
    </SettingsLayout>
</template>

<style></style>