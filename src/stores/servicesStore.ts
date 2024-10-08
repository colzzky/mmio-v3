import { servicesMap } from '@/modules/meta/routes'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServicesStore = defineStore('services', () => {
  const services = ref({
    meta: servicesMap,
  })
  function getServiceLinks(routePath: string) {
    if (routePath.startsWith('/meta')) return services.value.meta

    throw new Error('Platform not found')
  }

  function toggleServicePinnedStatus(routePath: string, serviceKey: string) {
    const services = getServiceLinks(routePath)
    const service = services.get(serviceKey)

    if (!service) throw new Error('Service not found')

    services.set(serviceKey, {
      ...service,
      pinned: !service.pinned,
    })
  }

  return { services, getServiceLinks, toggleServicePinnedStatus }
})
