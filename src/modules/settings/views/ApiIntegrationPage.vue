<script setup lang="ts">
import SettingsLayout from '@/core/layouts/SettingsLayout.vue';
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { usePlatformAPIStore } from '@/stores/platformAPIStore';
import { uiHelpers } from '@/core/utils/ui-helper';
import type { Timestamp } from 'firebase/firestore';
import MetaApiIntegration from '../components/APIIntegrationSettings/MetaApiIntegration.vue';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter()
const route = useRoute()
const useAuth = useAuthStore()
const platformApiStore = usePlatformAPIStore()
const { platformAPI, platform_api_list } = platformApiStore
const { user_auth } = useAuth

//Use this if you want a more dynamic loading
const pageLoad = ref<boolean>(false)
const pageDataLoad = ref<boolean>(true)

const load_account_apis = async () => {
    platform_api_list.isInitialized = false
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
        });

    }
    platform_api_list.isInitialized = true
    platform_api_list.isLoading = false
};

onMounted(async () => {
    await load_account_apis()
})


</script>
<template>
    <SettingsLayout>
        <main>
            <MetaApiIntegration
                v-if="route.name === 'settings-api-integrations-meta' || route.name === 'settings-api-integrations'" />
        </main>
    </SettingsLayout>
</template>

<style></style>