<script setup lang="ts">
import { loadFacebookSDK } from '@/core/utils/facebook-sdk';
import { Button } from '@/core/components/ui/button'
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { usePlatformAPIStore } from '@/stores/platformAPIStore';
import type { MetaAPIAccount, PlatformApiData } from '@/core/types/PlaformAPITypes'
import { uiHelpers } from '@/core/utils/ui-helper';
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
import Label from '@/core/components/ui/label/Label.vue';
import { useMetaRelatedStore } from '@/stores/metaRelatedStore';
import type { MetaPagesData, MetaPagesReturn, MetaPictureReturn } from '@/core/types/MetaTypes';
import generalAxiosInstance from '@/core/utils/general-axios-instance';
const useAuth = useAuthStore()
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
                fb_data.value = null
            }
        }, { scope: scopes });
    } catch (error) {
        fb_data.value = null
    }
};
//Watch during FB logged then save it to database
watch(fb_data, async (newValue, oldValue) => {
    if (newValue && fb_data.value) {
        const metaApi = await facebook_integration.exchangeForUserLongLivedToken(fb_data.value.authResponse.accessToken as string);
        if (metaApi) {
            set_fb_api(metaApi.api_account as MetaAPIAccount, metaApi)
        }
    }
});


const set_fb_api = (metaApi: MetaAPIAccount, fbPlatform: PlatformApiData) => {
    fb_api_load.value = true
    fb_api_information.value = metaApi
    fb_platform.value = fbPlatform
    //Add options here to fetch all pages
    fb_api_load.value = false
}

const set_fb_pages = async (): Promise<void> => {
    fb_pages_load.value = true
    const pages = await meta_page.getWhere([{ fieldName: 'pa_id', operator: '==', value: fb_platform.value?.pa_id }])
    meta_pages_list.data = pages.data
    fb_pages_load.value = false
}

const get_fb_pages = async () => {
    fb_pages_load.value = true
    if (fb_api_information.value && fb_platform.value) {
        const fb_platform_id = fb_platform.value.pa_id
        const fb_pages = await mpi.get_fb_pages(fb_api_information.value.accessToken)
        if (fb_pages && fb_pages.length !== 0) {
            await processFacebookPages(fb_pages, fb_platform_id)
        }
    }
    fb_pages_load.value = false
}

async function processFacebookPages(fb_pages: MetaPagesReturn[], platform_id: string) {
    for (const page of fb_pages) {
        const index_meta_page = meta_pages_list.data.findIndex(mp => mp.page_id === page.id)
        let type: 'new' | 'update' = 'new'
        if (index_meta_page !== -1) {
            type = 'update'
            meta_page.set(meta_pages_list.data[index_meta_page])
        } else {
            type = 'new'
            meta_page.initialize();
        }
        if (meta_page.data) {
            try {
                const fetch_page_image = await generalAxiosInstance(`https://graph.facebook.com/v21.0/${page.id}?fields=picture&access_token=${page.access_token}`)
                meta_page.data.picture = fetch_page_image.data.picture as MetaPictureReturn
            } catch (error) {
                console.log('something went wrong fetching image')
            }

            meta_page.data.pa_id = platform_id;
            meta_page.data.page_id = page.id;
            meta_page.data.access_token = page.access_token;
            meta_page.data.category = page.category;
            meta_page.data.name = page.name;
            await meta_page.createUpdate(type);
            if (type === 'new') {
                meta_pages_list.data.push(meta_page.data)
            }
            if (type === 'update') {
                meta_pages_list.data[index_meta_page] = { ...meta_page.data }
            }
        }
    }
}


onMounted(() => {
    componentLoad.value = true
    //Do something here when you want to change something to the DOM itself
    componentLoad.value = false
})

//Use Watch for more 
watch(() => platform_api_list.isInitialized, async (newValue, oldValue) => {
    if (newValue) {
        const platform = platform_api_list.data.find(api => api.platform === 'META');
        console.log(platform);
        if (platform) {
            set_fb_api(platform.api_account as MetaAPIAccount, platform);
            await set_fb_pages()
        }
    }
}
);
</script>
<template>
    <div v-if="!componentLoad">
        <div class="flex flex-col gap-y-4 gap-x-4 xl:gap-x-12 2xl:gap-x-16">
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
            <div class="flex justify-between items-center">
                <div>
                    <div class="text-2xl font-semibold">Your Meta Pages</div>
                    <Label>If you haven't find your pages please reauthenticate and check pagges you want to use</Label>
                </div>
                <Button v-if="!fb_pages_load" @click="get_fb_pages" size="xs" class="text-sm">
                    Export FB Pages
                </Button>
                <Button v-else variant="outline" size="xs" disabled class="flex items-center gap-2">
                    <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
                </Button>
            </div>
            <div v-if="!fb_pages_load">
                <div v-if="meta_pages_list.data.length">
                    <Card v-for="page in meta_pages_list.data" :key="page.mp_id">
                        <div class="grid-gap-4 py-4 px-4">
                            <div class=" flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage :src="page.picture ? page.picture.data.url : ''" alt="@radix-vue" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div class="flex flex-col gap-3">
                                    <div class="flex-1 space-y-1">
                                        <p class="text-sm font-medium leading-none">
                                            {{ page.name }}
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
                        </div>
                    </Card>
                </div>
                <div v-else>
                    It seems that you haven't exported your pages yet. Export now
                </div>
            </div>
            <div v-else>
                <Card>
                    <div class="grid-gap-4 py-4 px-4">
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