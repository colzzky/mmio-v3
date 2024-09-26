<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Header from '@/core/components/Header.vue'
import { useServicesStore } from '@/stores/servicesStore'

const serviceStore = useServicesStore()
const services = serviceStore.services
</script>

<template>
  <Header :showSidebarButton="false" :showServicesButton="false" />
  <main
    class="grid min-h-[calc(100svh-theme(spacing.16))] place-content-center bg-slate-100 p-8 lg:p-12 xl:p-16 2xl:p-20"
  >
    <div
      class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0"
    >
      <div
        v-for="(service, serviceIndex) in services"
        :key="service.name"
        :class="[
          serviceIndex === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
          serviceIndex === 1 ? 'sm:rounded-tr-lg' : '',
          serviceIndex === services.length - 2 ? 'sm:rounded-bl-lg' : '',
          serviceIndex === services.length - 1
            ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
            : '',
          'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-slate-500',
        ]"
      >
        <div>
          <span class="inline-flex rounded-lg bg-slate-50 p-3 text-slate-700 ring-4 ring-white">
            <Icon :icon="service.icon" class="size-6" aria-hidden="true" />
          </span>
        </div>
        <div class="mt-8">
          <h3 class="font-semibold leading-6">
            <a :href="service.href" class="focus:outline-none">
              <!-- Extend touch target to entire panel -->
              <span class="absolute inset-0" aria-hidden="true" />
              {{ service.name }}
            </a>
          </h3>
          <p class="mt-2 text-sm text-foreground/60">
            Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut
            at blanditiis et quo et molestiae.
          </p>
        </div>
        <span
          class="pointer-events-none absolute right-6 top-6 text-foreground/25 group-hover:text-foreground/50"
          aria-hidden="true"
        >
          <svg class="size-6" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z"
            />
          </svg>
        </span>
      </div>
    </div>
  </main>
</template>
