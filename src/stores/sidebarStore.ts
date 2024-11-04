import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export const useSidebarStore = defineStore('sidebar', () => {
  const route = useRoute()

  // TOGGLE MOBILE SIDEBAR
  const isMobileSidebarOpen = ref(false)
  function toggleMobileSidebar(value: 'on' | 'off') {
    isMobileSidebarOpen.value = value === 'on' ? true : false
  }

  const platformName = computed(() => route.fullPath.split('/').filter(Boolean)[2])

  const platformHeading = computed(() => {
    if (platformName.value === 'meta') return 'Meta Automation'

    return 'UNHANDLED PLATFORM HEADING CASE'
  })

  return {
    isMobileSidebarOpen,
    toggleMobileSidebar,
    platformName,
    platformHeading,
  }
})
