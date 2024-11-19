import { services as metaServices } from '@/modules/meta/routes'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useServicesStore = defineStore('services', () => {
  const services = ref(new Map([['meta', metaServices]]))

  const pinnedServices = computed(() =>
    Array.from(services.value.values()).flatMap((platform) =>
      Array.from(platform).filter(([, service]) => service.pinned),
    ),
  )

  function toggleServicePinnedStatus(serviceName: string) {
    const platform = Array.from(services.value.entries()).find(([, platformServices]) =>
      platformServices.has(serviceName),
    )
    if (!platform) throw new Error('No platform found')

    const [, platformServices] = platform

    const service = platformServices.get(serviceName)
    if (!service) throw new Error('No service found')

    platformServices.set(serviceName, {
      ...service,
      pinned: !service.pinned,
    })
  }

  return { services, pinnedServices, toggleServicePinnedStatus }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useServicesStore, import.meta.hot))
}
