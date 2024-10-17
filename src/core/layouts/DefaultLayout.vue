<script setup lang="ts">
import ServicesModal from '../components/services-modal.vue'
import DesktopSidebar from '../components/sidebar/desktop-sidebar.vue'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar'
import { Card } from '../components/ui/card'
import Toaster from '../components/ui/toast/Toaster.vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/core/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { useProjectStore } from '@/stores/projectStore'
import { useServicesStore } from '@/stores/servicesStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from '../components/ui/toast'
const useProject = useProjectStore()
const { project_data } = useProject
const router = useRouter()
const layoutLoad = ref<boolean>(true)

const sidebarStore = useSidebarStore()
const route = useRoute()
const heading = sidebarStore.getServiceHeading(route.path)

const isPlatformServicesCollapsibleOpen = ref(true)

const isServicesModalOpen = ref(false)

const servicesStore = useServicesStore()
const services = servicesStore.getServiceLinks(route.path)
const pinnedServices = computed(() => [...services].filter(([, service]) => service.pinned))

function toggleServicesModal() {
  isServicesModalOpen.value = !isServicesModalOpen.value
}

const breadcrumbs = route.path.split('/').slice(3)
const parentRoute = breadcrumbs[0]
const project_id = ref<string>('')

onMounted(async () => {
  layoutLoad.value = true
  //Get the Project Id
  const pj_id = route.params.pj_id
  //Check PJ Id if null if null return to home page
  if (pj_id) {
    //Check first if Project which is created already exist or initialized. If not fetch the project from firestore
    if (!project_data.data || !project_data.isInitialized) {
      const get = await project_data.get(pj_id as string)
      //Check the statue of firestore get is a success or if the is an existing data
      if (get.status) {
        project_data.set(get.data)
        project_id.value = get.data.pj_id

        /** 
        ---->This is where we check if the project is META/ EMAIL MARKETING ETC.<---
        */

      } else {
        toast({
          title: 'Project does not exist',
          description: 'Please choose a project first before proceeding',
          variant: 'success',
        })
        router.push({ name: 'home' })
      }
    } else {
      //Check if the one initilized matched from the PJ
      if (pj_id != project_data.data.pj_id) {
        toast({
          title: 'Project does not exist',
          description: 'Please choose a project first before proceeding',
          variant: 'success',
        })
        router.replace({ name: 'home' })
      }
    }
  } else {
    console.log('Page does not exist')
    router.replace({ name: 'home' })
  }
  layoutLoad.value = false
})


</script>

<template>
  <Toaster />

  <div v-if="!layoutLoad">
    <!-- <MobileSidebar /> -->
    <DesktopSidebar>
      <!-- heading -->
      <li>
        <h1 class="text-xs font-bold uppercase text-primary/75">{{ heading }}</h1>
      </li>

      <!-- navigation routes -->
      <li>
        <ul role="list" class="-mx-2">
          <li>
            <RouterLink :to="{ name: parentRoute, params: { pj_id: project_id } }"
              class="group flex items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground">
              <i class="material-icons text-xl">grid_view</i>
              Dashboard
            </RouterLink>
          </li>
          <li>
            <button
              class="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold hover:bg-primary/25"
              @click="toggleServicesModal">
              <i class="material-icons text-xl">bookmark_border</i>
              Manage Services
            </button>
          </li>
        </ul>
      </li>

      <!-- pinned services -->
      <Collapsible v-model:open="isPlatformServicesCollapsibleOpen" class="flex flex-col gap-y-1">
        <CollapsibleTrigger
          class="flex w-full items-center justify-between text-xs font-bold uppercase text-primary/75">
          Pinned Services
          <i :class="[
            'material-icons text-2xl transition-transform',
            isPlatformServicesCollapsibleOpen && 'rotate-180',
          ]">
            arrow_drop_down
          </i>
        </CollapsibleTrigger>
        <CollapsibleContent as="ul" class="-mx-2">
          <li v-for="[name, service] in pinnedServices" :key="name">
            <RouterLink :to="{ name, params: { pj_id: project_id } }"
              class="grid grid-cols-[20px_1fr_20px] items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground">
              <i :class="['bx text-xl', service.icon]"></i>
              <span>
                {{ service.label }}
              </span>
              <button class="grid place-content-center"
                @click.prevent="servicesStore.toggleServicePinnedStatus(route.path, name)">
                <i class="material-icons text-xl">bookmark</i>
              </button>
            </RouterLink>
          </li>
        </CollapsibleContent>
      </Collapsible>
    </DesktopSidebar>

    <!-- services modal -->
    <ServicesModal v-model:open="isServicesModalOpen" />

    <div class="lg:pl-72">
      <!-- header -->
      <header class="p-4">
        <Card class="flex items-center gap-x-2 bg-primary/5 px-4 py-2">
          <div class="flex grow flex-col gap-y-1">
            <DropdownMenu>
              <DropdownMenuTrigger class="flex items-center self-start text-xs/4 font-bold">
                Marketing Master IO Page
                <i class="material-icons">arrow_drop_down</i>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Item #1</DropdownMenuItem>
                <DropdownMenuItem>Item #2</DropdownMenuItem>
                <DropdownMenuItem>Item #3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <!-- <Breadcrumb>
              <BreadcrumbList class="text-xs/4">
                <BreadcrumbItem v-for="breadcrumb in breadcrumbs" :key="breadcrumb">
                  <BreadcrumbLink v-if="breadcrumb !== route.name" as-child>
                    <RouterLink :to="{ name: breadcrumb }">
                      {{ uiHelpers.toTitleCase(breadcrumb) }}
                    </RouterLink>
                  </BreadcrumbLink>
                  <BreadcrumbPage v-else>
                    {{ uiHelpers.toTitleCase(breadcrumb) }}
                  </BreadcrumbPage>
                  <BreadcrumbSeparator v-if="breadcrumb !== breadcrumbs[breadcrumbs.length - 1]" />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> -->
          </div>
          <RouterLink to="/" class="grid place-content-center">
            <i class="material-icons text-3xl">keyboard_return</i>
          </RouterLink>
          <button class="grid place-content-center">
            <i class="material-icons text-3xl">notifications</i>
          </button>
          <Avatar>
            <AvatarImage src="https://placehold.co/48" />
            <AvatarFallback>UI</AvatarFallback>
          </Avatar>
        </Card>
      </header>

      <!-- main content -->
      <slot />
    </div>
  </div>
  <div v-else class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div class="flex items-center gap-x-1 animate-pulse">
      <i class="material-icons text-4xl">pin</i>
      <span class="text-xl font-extrabold">MMIO</span>
    </div>
    <div class="flex items-center justify-center space-x-2">
      <i class="material-icons animate-spin text-sm">donut_large</i>
      <div>Loading</div>
    </div>
  </div>
</template>
