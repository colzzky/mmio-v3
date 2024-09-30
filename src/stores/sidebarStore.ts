import { links as metaLinks } from '@/modules/meta/routes'
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

  // GET SERVICE LINKS
  const links = ref({
    meta: metaLinks,
  })

  function getServiceLinks(routePath: string) {
    if (routePath.includes('meta')) return links.value.meta

    throw new Error('Service not found')
  }

  return {
    isMobileSidebarOpen,
    toggleMobileSidebar,
    logoutUser,
    links,
    getServiceLinks,
  }
})
