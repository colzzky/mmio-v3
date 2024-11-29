<script setup lang="ts">
import ImportIntegrationModal from '../components/import-integration-modal.vue'
import { options, integrations } from '../temporaries'
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/core/components/ui/dropdown-menu'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import type { MetaPageData } from '@/core/types/MetaTypes'
import { PermissionServices } from '@/core/types/PermissionTypes'
import type { MetaPageRefs, WSMetaPagesRefsData } from '@/core/types/WorkSpaceTypes'
import { PermissionAccessError, servicePermission } from '@/core/utils/permissionHelpers'
import { uiHelpers } from '@/core/utils/ui-helper'
import router from '@/router'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { useWorkspaceStore } from '@/stores/WorkspaceStore'
import { identity } from '@vueuse/core'
import { computed, reactive, useTemplateRef, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { deleteCollection } from '@/core/utils/firebase-collections'
import { useMetaRelatedStore } from '@/stores/metaRelatedStore'

const authWorkspaceStore = useAuthWorkspaceStore()
const metaStore = useMetaRelatedStore()
const { imported_meta_pages, active_workspace } = authWorkspaceStore
const { meta_page: meta_page_md } = metaStore

interface Identifier {
  identifier: string
  title: string
  icon: string
  description: string
}
const route = useRoute()
const selectedOption = reactive({
  selected: <Identifier | null>null,
  async initialize_identifier(identifier: Identifier | null) {
    identifier ? this.selected = identifier : this.selected = null
    identifier ? router.push({
      query: { selectedOptionQuery: identifier.identifier },
      replace: true
    }) : router.push({
      query: { selectedOptionQuery: null },
      replace: true
    })

    if (identifier && identifier.identifier === 'meta_pages') {
      await imported_meta_pages.fetch_meta_pages()
      console.log(active_workspace.data)
    }
  }
})

function page_initialize() {
  if (route.query.selectedOptionQuery) {
    const find_identified = options.find(option => route.query.selectedOptionQuery === option.identifier)
    if (find_identified) {
      selectedOption.initialize_identifier(find_identified)
    } else {
      router.push({
        query: { selectedOptionQuery: null },
        replace: true
      })
    }
  }
}
async function testRemove(mp_id: string) {
  if (active_workspace.data && active_workspace.data.meta_pages_refs) {
    const workspace_meta_refs_index = active_workspace.data.meta_pages_refs.findIndex(mp => mp.mp_id === mp_id)
    const meta_page_index = imported_meta_pages.data.findIndex(mp => mp.mp_id === mp_id)
    const meta_page_refs_index = imported_meta_pages.reference.findIndex(mp => mp.mp_id === mp_id)
    if (workspace_meta_refs_index >= 0 && meta_page_index >= 0 && meta_page_refs_index >= 0) {
      meta_page_md.set(imported_meta_pages.data[meta_page_index])
      if (meta_page_md.data) {
        meta_page_md.data.isOnProject = false
        await meta_page_md.createUpdate('update')
      }
      await deleteCollection('ws_meta_pages_refs', 'workspaces/:ws_id/meta_pages_refs', { ws_id: active_workspace.data.ws_id }, mp_id)

      imported_meta_pages.data.splice(meta_page_index, 1);
      imported_meta_pages.reference.splice(meta_page_refs_index, 1);
      active_workspace.data.meta_pages_refs.splice(workspace_meta_refs_index, 1);
    }
  }



}

onMounted(async () => {
  try {
    await servicePermission.check(PermissionServices.WorskspaceSettings, ['view'])
    page_initialize()
  } catch (error: any) {
    if (error instanceof PermissionAccessError) router.back(); return;
  }
})

const importIntegrationModalRef = useTemplateRef('importIntegrationModal')
</script>

<template>
  <div class="container mx-auto mt-4">
    <section v-if="!selectedOption.selected">
      <ul class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] grid-rows-[1fr_fit-content_1fr_1fr] gap-8">
        <li v-for="option in options" :key="option.identifier" :value="option.title"
          class="row-span-4 grid grid-rows-subgrid gap-y-0 rounded-md border bg-primary/5 p-4">
          <div class="flex items-center gap-x-2 text-lg font-bold">
            <i :class="['bx text-2xl', option.icon]" />
            <h2>
              {{ option.title }}
            </h2>
          </div>
          <p class="text-xs">{{ option.description }}</p>
          <div class="mt-4 text-sm font-medium">
            {{ integrations[option.identifier].length }} Integrations
          </div>
          <Button variant="link" class="p-0 mt-4 justify-self-end text-sm font-medium text-blue-500"
            @click="selectedOption.initialize_identifier(option)">
            View linked {{ option.title }}
          </Button>
        </li>
      </ul>
    </section>
    <section v-else class="grid gap-y-4">
      <div class="flex items-center justify-between">
        <span @click="selectedOption.initialize_identifier(null)"
          class="flex items-center gap-x-2 font-bold cursor-pointer">
          <i class="material-icons">keyboard_return</i>
          {{ selectedOption.selected.title }}
        </span>
        <Button @click="importIntegrationModalRef?.modal.open(selectedOption.selected.title)">
          Import {{ selectedOption.selected.title }}
        </Button>
      </div>
      <div v-if="!imported_meta_pages.isLoading"
        class="grid grid-cols-4 [&>*]:h-[32vh] [&>*]:bg-gray-100 [&>*]:border [&>*]:border-gray-200 [&>*]:rounded-lg gap-4">
        <div v-for="(integration, index) in imported_meta_pages.reference" :key="index"
          class="hover:bg-slate-100 overflow-y-auto">
          <div class="max-w-sm mx-auto p-4 space-y-2">
            <div class="group relative cursor-pointer overflow-hidden rounded-lg">
              <img :src="integration.image" alt="Dynamic Image"
                class="h-[20vh] w-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div class="">
              <div class="flex flex-col gap-1">
                <div class="flex items-center space-x-2 justify-between max-w-sm">
                  <span class="text-md font-bold block truncate">{{ integration.page_name }}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <span class="sr-only">Open Integrations Menu</span>
                      <i class="bx bx-dots-vertical-rounded text-xl" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem class="gap-x-3">
                        <i class="bx bx-info-circle text-xl" />
                        Page Information
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3">
                        <i class="bx bxs-toggle-right text-xl" />
                        Activate
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3">
                        <i class="bx bx-log-in text-xl" />
                        Reauthenticate
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3" @click="testRemove(integration.mp_id)">
                        <i class="bx bx-trash text-xl" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium">Imported By:</span>
                  <span class="text-sm">{{ integration.imported_by }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium">Imported At:</span>
                  <span class="text-sm">{{ uiHelpers.formatDateTimeAgo(integration.importedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="grid grid-cols-4 [&>*]:h-[32vh] [&>*]:border [&>*]:border-gray-200 gap-4 [&>*]:rounded-lg">
        <div v-for="i in 3" :key="i" class="">
          <div class="max-w-sm mx-auto p-4 space-y-3">
            <div class="group relative cursor-pointer overflow-hidden rounded-lg">
              <Skeleton class="h-[20vh] w-full object-cover group-hover:scale-110 bg-gray-300" />
            </div>
            <div class="">
              <div class="flex flex-col gap-2">
                <Skeleton class="h-4 w-1/2 rounded-full bg-gray-300" />
                <Skeleton class="h-3 w-32 rounded-full bg-gray-300" />
                <Skeleton class="h-3 w-1/3 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>

  </div>

  <ImportIntegrationModal ref="importIntegrationModal" />
</template>
