<script setup lang="ts">
import MetaApiIntegration from '../components/APIIntegrationSettings/MetaApiIntegration.vue'
import { usePlatformAPIStore } from '@/stores/platformAPIStore'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

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
