import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useSidebarStore = defineStore('sidebar', () => {
  // TOGGLE MOBILE SIDEBAR
  const isMobileSidebarOpen = ref(false)
  function toggleMobileSidebar(value: 'on' | 'off') {
    isMobileSidebarOpen.value = value === 'on' ? true : false
  }

  // LOGOUT USER
  const router = useRouter()
  function logoutUser() {
    router.push('/login')
  }

  // GET SERVICE HEADING
  const serviceHeading = ref({
    meta: 'Meta Automation',
  })

  function getServiceHeading(routePath: string) {
    if (routePath.includes('meta')) return serviceHeading.value.meta

    throw new Error('Service not found')
  }

  return {
    isMobileSidebarOpen,
    toggleMobileSidebar,
    logoutUser,
    getServiceHeading,
  }
})
