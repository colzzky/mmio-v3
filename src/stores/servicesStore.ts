import { servicesBar } from '@/modules/meta/routes'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServicesStore = defineStore('services', () => {
  const services = ref({
    meta: servicesBar,
  })
  function getServiceLinks(routePath: string) {
    if (routePath.startsWith('/meta')) return services.value.meta

    throw new Error('Platform not found')
  }
  function pinService(routePath: string, service: (typeof servicesBar)[number]['href']) {
    const services = getServiceLinks(routePath)
    const serviceIndex = services.findIndex((s) => s.href === service)

    const foundService = services.at(serviceIndex)
    if (!foundService) throw new Error('Service not found')

    foundService.pinned = !foundService.pinned
  }

  return { services, getServiceLinks, pinService }
})
