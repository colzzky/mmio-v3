<script setup lang="ts">
import MetaApiIntegration from '../components/APIIntegrationSettings/MetaApiIntegration.vue'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthStore } from '@/stores/authStore'
import { usePlatformAPIStore } from '@/stores/platformAPIStore'
import type { Timestamp } from 'firebase/firestore'
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const platformApiStore = usePlatformAPIStore()
const { platform_api_list } = platformApiStore

onMounted(async () => {
  await platform_api_list.initializeAccountApis()
})
</script>
<template>
  <main>
    <MetaApiIntegration
      v-if="route.name === 'settings-api-integrations-meta' || route.name === 'api-integrations'"
    />
  </main>
</template>

<style></style>
