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

onMounted(async () => {
    await platform_api_list.initializeAccountApis()
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