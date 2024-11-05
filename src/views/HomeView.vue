<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toast } from '@/core/components/ui/toast'
import HomeLayout from '@/core/layouts/HomeLayout.vue'
import type { Timestamp } from '@/core/types/UniTypes'
import type { Platforms, WorkspaceData } from '@/core/types/WorkSpaceTypes'
import { getWhereAny } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { serverTimestamp, type DocumentSnapshot } from 'firebase/firestore'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const useAuth = useAuthStore()
const useProject = useProjectStore()
const { workspace_data, workspace_list } = useProject
const { user_auth } = useAuth
const router = useRouter()
const pageLoad = ref<boolean>(true)
const sidebarStore = useSidebarStore()

onMounted(async () => {
  pageLoad.value = true

  if (!workspace_list.isInitialized) {
    //await loadMoreProjects()
    workspace_list.isInitialized = true
  }
  pageLoad.value = false
})

// const loadMoreProjects = async () => {
//   workspace_list.isLoading = true
//   const get_projects = await getWhereAny(
//     'workspaces_share',
//     'workspaces/:ws_id/share/',
//     { ws_id: '' },
//     ['shared'],
//     [{ fieldName: '' }],
//     [],
//   )

//   console.log(get_projects)

//   if (get_projects.status && get_projects.data) {
//     if (get_projects.data.length > 0) {
//       workspace_list.lastSnapshot = get_projects.data[get_projects.data.length - 1].ws_id
//     }
//     get_projects.data.forEach((project) => {
//       workspace_list.data.push(project)
//     })
//   }
//   workspace_list.isLoading = false
// }

interface PlatformsIcon {
  name: Platforms
  icon: string
}

const platforms: PlatformsIcon[] = [
  { name: 'META', icon: 'bxl-meta' },
  { name: 'Email-Marketing', icon: 'bx-envelope' },
  { name: 'Google-My-Business', icon: 'bxl-google' },
  { name: 'Whatsapp', icon: 'bxl-whatsapp' },
  { name: 'SMS-Marketing', icon: 'bx-message-rounded' },
  { name: 'E-Commerce', icon: 'bx-shopping-bag' },
  { name: 'OmniChannel', icon: 'bx-group' },
]

const find_icon = (name: string): string | undefined => {
  const platform = platforms.find((platform) => platform.name === name)
  const icon = platform ? platform.icon : undefined
  console.log(icon)
  return icon
}

const navigateToProject = (workspace: WorkspaceData) => {
  //We can set a validation by fetching from firebaste itself calling get
  //For faster validation we can check based on what we fetched earlier
  const validate = workspace_list.data.find((proj) => proj.ws_id === workspace.ws_id)
  if (validate) {
    workspace_data.set(workspace)
    router.push({ name: workspace.platform.toLowerCase(), params: { ws_id: workspace.ws_id } })
  } else {
    toast({
      title: 'Project does not exist',
      description: 'Please choose a project first before proceeding',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <div
    class="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8"
  >
    <button
      type="button"
      class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
      @click="sidebarStore.toggleMobileSidebar('on')"
    >
      <span class="sr-only">Open sidebar</span>
      <i class="bx bx-menu text-2xl" aria-hidden="true" />
    </button>

    <!-- Separator -->
    <div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true"></div>

    <div class="flex flex-1 justify-end">
      <span class="isolate inline-flex rounded-md">
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <i class="material-icons text-md">search</i>
          </div>
          <input
            class="block h-9 w-full rounded-l-md border-0 py-1 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
            placeholder="Search Campaigns"
          />
        </div>
        <div
          class="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
        >
          <ProjectCenter />
        </div>
      </span>
    </div>
  </div>

  <main class="py-2">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="w-full px-2 py-2">
        <div class="rounded-xl px-2 py-2">
          <div class="grid grid-cols-12 items-center">
            <div class="col-span-5 text-xs font-light">Name</div>
            <div class="col-span-2 text-xs font-light">Created</div>
            <div class="col-span-2 text-xs font-light">Updated</div>
            <div class="col-span-1 text-xs font-light">Status</div>
            <div class="col-span-1 text-xs font-light">Last Updated</div>
            <div class="col-span-1 text-xs font-light"></div>
          </div>
        </div>

          <div v-if="!pageLoad">
            <div v-if="workspace_list.data.length">
              <div
                v-for="project in workspace_list.data"
                :key="project.name"
                class="cursor-pointer rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300"
              >
                <div class="grid grid-cols-12 items-center">
                  <div class="col-span-5" @click="navigateToProject(project)">
                    <div class="flex items-center gap-x-3">
                      <i class="bx text-2xl" :class="find_icon(project.platform)"></i>
                      <div class="grid gap-0">
                        <span class="text-sm"
                          >{{ project.name }} - {{ project.connectedAccount?.name }}</span
                        >
                        <span class="text-xs">{{ project.ws_id }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-span-2 text-sm text-gray-600">
                    {{ uiHelpers.timestampToDateTimeAgo(project.createdAt) }}
                  </div>
                  <div class="col-span-2 text-sm text-gray-600">
                    {{ uiHelpers.timestampToDateTimeAgo(project.updatedAt) }}
                  </div>
                  <div class="col-span-1 text-sm text-gray-600">{{ project.status }}</div>
                  <div class="col-span-1 text-sm text-gray-600">Owner</div>
                  <div class="col-span-1 justify-self-end">
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-full text-black duration-100 hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <i class="material-icons text-md">more_vert</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>No Data found</div>
          </div>

          <div v-if="pageLoad || workspace_list.isLoading" class="rounded-xl px-2 py-4">
            <div class="grid grid-cols-12 items-center">
              <div class="col-span-5">
                <Skeleton class="h-3 w-[300px] rounded-full bg-gray-300" />
              </div>
              <div class="col-span-2">
                <Skeleton class="h-3 w-[200px] rounded-full bg-gray-300" />
              </div>
              <div class="col-span-2">
                <Skeleton class="h-3 w-[200px] rounded-full bg-gray-300" />
              </div>
              <div class="col-span-1">
                <Skeleton class="h-3 w-[100px] rounded-full bg-gray-300" />
              </div>
              <div class="col-span-1">
                <Skeleton class="h-3 w-[100px] rounded-full bg-gray-300" />
              </div>
            </div>
          </div>

        <div class="flex items-center justify-end gap-2">
          <Button variant="outline" size="xs">
            Sample Load More
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>
