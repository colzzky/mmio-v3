<script setup lang="ts">
import Button from '@/core/components/ui/button/Button.vue'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toast } from '@/core/components/ui/toast'
import HomeLayout from '@/core/layouts/HomeLayout.vue'
import type { Platforms, ProjectData } from '@/core/types/ProjectTypes'
import type { Timestamp } from '@/core/types/UniTypes'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { serverTimestamp, type DocumentSnapshot } from 'firebase/firestore';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
const useAuth = useAuthStore()
const useProject = useProjectStore()
const { project_data, project_list } = useProject
const { user_auth } = useAuth
const router = useRouter()
const pageLoad = ref<boolean>(true)

onMounted(async () => {
  pageLoad.value = true

  if (!project_list.isInitialized) {
    await loadMoreProjects()
    project_list.isInitialized = true
  }
  pageLoad.value = false
})

const loadMoreProjects = async () => {
  project_list.isLoading = true

  const get_projects = await project_data.getWhere([
    { fieldName: 'shared_uids', operator: 'array-contains', value: user_auth.data?.uid },

  ], 2, [
    { fieldName: 'createdAt', direction: 'desc' },
  ], project_list.lastSnapshot)

  console.log(get_projects)

  if (get_projects.status) {
    if (get_projects.data.length > 0) {
      project_list.lastSnapshot = get_projects.data[get_projects.data.length - 1].pj_id
    }
    get_projects.data.forEach((project) => {
      project_list.data.push(project)
    })
  }
  project_list.isLoading = false
}

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

const navigateToProject = (project: ProjectData) => {
  //We can set a validation by fetching from firebaste itself calling get
  //For faster validation we can check based on what we fetched earlier
  const validate = project_list.data.find(proj => proj.pj_id === project.pj_id)
  if (validate) {
    project_data.set(project)
    router.push({ name: project.platform.toLowerCase(), params: { pj_id: project.pj_id } })
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
  <HomeLayout>
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
            <div v-if="project_list.data.length">
              <div v-for="project in project_list.data" :key="project.name"
                class="cursor-pointer rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300">
                <div class="grid grid-cols-12 items-center">
                  <div class="col-span-5" @click="navigateToProject(project)">
                    <div class="flex items-center gap-x-3">
                      <i class="bx text-2xl" :class="find_icon(project.platform)"></i>
                      <div class="grid gap-0">
                        <span class="text-sm">{{ project.name }} - {{project.connectedAccount?.name}}</span>
                        <span class="text-xs">{{ project.pj_id }}</span>
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
                    <button type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-full text-black duration-100 hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                      <i class="material-icons text-md">more_vert</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>No Data found</div>
          </div>

          <div v-if="pageLoad || project_list.isLoading" class="rounded-xl px-2 py-4">
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
            <Button variant="outline" size="xs" @click="loadMoreProjects()">
              Sample Load More
            </Button>
          </div>
        </div>
      </div>
    </main>
  </HomeLayout>
</template>
