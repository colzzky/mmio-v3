import { useSidebarStore } from './sidebarStore'
import { services as metaServices, type Service } from '@/modules/meta/routes'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useServicesStore = defineStore('services', () => {
  const sidebarStore = useSidebarStore()

  const services = ref<Record<string, Map<string, Service>>>({
    meta: metaServices,
  })

  const platformServices = computed(() => services.value[sidebarStore.platformName])
  const pinnedServices = computed(() =>
    Array.from(platformServices.value).filter(([, service]) => service.pinned),
  )

  function toggleServicePinnedStatus(serviceName: string) {
    const service = platformServices.value.get(serviceName)
    if (!service) throw new Error('Service not found')

    platformServices.value.set(serviceName, {
      ...service,
      pinned: service.pinned === true ? false : true,
    })
  }

  return { services, platformServices, pinnedServices, toggleServicePinnedStatus }
})
