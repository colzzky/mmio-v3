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

  return {
    isMobileSidebarOpen,
    toggleMobileSidebar,
    platformName,
  }
})
