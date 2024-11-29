<script setup lang="ts">
import Checkbox from '@/core/components/ui/checkbox/Checkbox.vue'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent } from '@/core/components/ui/dialog'
import { getWhereAny, postCollectionBatch, postCollectionBatchAtomic, postMultipleCollectionsAtmoic, postMultipleCollectionsBatchAtomic, type FSPostBatchCollection, type FSPostMultiCollectAtomic } from '@/core/utils/firebase-collections'
import type { MetaPageData, Modal, WSMetaPagesRefsData } from '@/core/utils/types'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthStore } from '@/stores/authStore'
import { useMetaRelatedStore } from '@/stores/metaRelatedStore'
import { reactive, ref } from 'vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import { useWorkspaceStore } from '@/stores/WorkspaceStore'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import type { CollectionsInterface } from '@/core/types/FirestoreTypes'


const authStore = useAuthStore()
const authWorkspaceStore = useAuthWorkspaceStore()
const metaStore = useMetaRelatedStore()
const workspaceStore = useWorkspaceStore()
const { user_auth, user } = authStore
const { meta_page } = metaStore
const { workspace_meta_pages_refs } = workspaceStore
const { active_workspace, imported_meta_pages } = authWorkspaceStore


interface ModalInterface extends Omit<Modal, 'open'> {
  integrationName: string | null
  open(integrationName: string): void
  initialize(): void
}
interface ModalInterface extends Omit<Modal, 'open'> {
  integrationName: string | null
  open(integrationName: string): void
  initialize(): void
}

const emit = defineEmits<{
  (e: 'return', value: MetaPageData[] | null): void
}>()

const modal = reactive<ModalInterface>({
  isOpen: false,
  integrationName: null,
  initialState() {
    this.isOpen = false
    this.integrationName = null
  },
  open(integrationName) {
    this.isOpen = true
    this.integrationName = integrationName
    this.initialize()
  },
  initialize() {
    if (this.integrationName === 'Meta Pages') {
      meta_import.get_meta_pages()
    }
  },
  close() {
    this.initialState()
  },
})

const meta_import = reactive({
  meta_pages: <MetaPageData[]>([]),
  selected_meta_pages: <string[]>([]),
  isLoading: <boolean>false,
  async get_meta_pages() {
    this.isLoading = true
    const get_pages = await getWhereAny('meta_page', 'meta_pages', {}, [], [
      { fieldName: 'owner_uid', operator: '==', value: user_auth.data?.uid },
      { fieldName: 'isOnProject', operator: '==', value: false }
    ])
    if (get_pages.status || get_pages.data.length > 0) {
      this.meta_pages = get_pages.data
    }
    this.isLoading = false
  },
  select_page(page: MetaPageData) {
    if (this.selected_meta_pages.includes(page.mp_id)) {
      this.selected_meta_pages = this.selected_meta_pages.filter((mp_id) => mp_id !== page.mp_id)
    } else {
      this.selected_meta_pages.push(page.mp_id)
    }
  },
  async import_meta_page() {
    if (active_workspace.data) {
      const act_wsp = active_workspace.data
      const batch_ws_meta_refs = <WSMetaPagesRefsData[]>[]
      const batch_meta_page = <MetaPageData[]>[]

      this.selected_meta_pages.forEach(page_id => {
        const selected_page = this.meta_pages.find(mp => mp.mp_id === page_id)
        if (selected_page) {
          workspace_meta_pages_refs.reInit()
          workspace_meta_pages_refs.data.mp_id = selected_page.mp_id
          workspace_meta_pages_refs.data.imported_by_uid = user_auth.data ? user_auth.data.uid : ''
          batch_ws_meta_refs.push(JSON.parse(JSON.stringify(workspace_meta_pages_refs.data)))
          batch_meta_page.push(JSON.parse(JSON.stringify({ ...selected_page, isOnProject: true })))
        }
      });

      if (batch_meta_page.length > 0 && batch_ws_meta_refs.length > 0) {
        const post_batch = await postMultipleCollectionsBatchAtomic([
          {
            $col: 'ws_meta_pages_refs',
            $path: 'workspaces/:ws_id/meta_pages_refs',
            $sub_params: { ws_id: act_wsp.ws_id },
            ids: this.selected_meta_pages,
            data: batch_ws_meta_refs
          },
          {
            $col: 'meta_page',
            $path: 'meta_pages',
            $sub_params: {},
            ids: this.selected_meta_pages,
            data: batch_meta_page
          },
        ])



        if (post_batch.status) {
          batch_meta_page.forEach(mp => {
            imported_meta_pages.data.push(mp)
            imported_meta_pages.reference.push(
              {
                page_name: mp.name,
                image: mp.picture ? mp.picture.data.url : '',
                imported_by: user.data && user.data.displayName ? user.data.displayName : '',
                importedAt: post_batch.data[0].createdAt,
                mp_id: mp.mp_id,
                updatedAt: post_batch.data[0].updatedAt,
              }
            )
          })
          console.log(batch_meta_page)
          console.log(imported_meta_pages)
          this.meta_pages = []
          this.selected_meta_pages = []
          console.log(batch_meta_page)
          console.log(imported_meta_pages)
          modal.close()
        }
      }
    }
  }
})

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="max-w-screen-md p-12">
      <section class="grid gap-y-12">
        <h2
          class="text-balance bg-gradient-to-r from-gradient-purple to-gradient-red bg-clip-text text-center text-5xl font-bold text-transparent">
          Choose the {{ modal.integrationName }} you want to import
        </h2>
        <div class="w-full py-4">
          <div class="rounded-xl px-2">
            <div class="grid grid-cols-12 items-center">

              <div class="col-span-1 font-light">
              </div>

              <div class="col-span-7 text-xs font-light">Name</div>
              <div class="col-span-2 text-xs font-light">Created At</div>
              <div class="col-span-2 text-xs font-light">Updated At</div>

            </div>
          </div>

          <div v-if="!meta_import.isLoading" class="py-2">
            <div v-if="meta_import.meta_pages.length > 0">
              <div v-for="page in meta_import.meta_pages" :key="page.mp_id"
                class="cursor-pointer rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300">
                <div class="grid grid-cols-12 items-center">
                  <div class="col-span-1">
                    <Checkbox @update:checked="meta_import.select_page(page)"
                      :checked="meta_import.selected_meta_pages.includes(page.mp_id)" />
                  </div>

                  <div class="col-span-7" @click="">
                    <div class="flex items-center">
                      <i class="bx bx-google text-2xl"></i>
                      <div class="grid gap-0">
                        <span class="text-sm">{{ page.name }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-span-2 text-sm text-gray-600">
                    {{ uiHelpers.formatDateTimeAgo(page.createdAt) }}
                  </div>
                  <div class="col-span-2 text-sm flex flex-col text-gray-600">
                    {{ uiHelpers.formatDateTimeAgo(page.updatedAt) }}
                  </div>

                </div>
              </div>
            </div>
            <div v-else>No available data.</div>
          </div>
          <div v-else class="py-2">
            <div class="rounded-xl px-2 py-4">
              <div class="grid grid-cols-12 items-center space-x-3">
                <div class="col-span-5">
                  <Skeleton class="h-3 w-[full] rounded-full bg-gray-300" />
                </div>
                <div class="col-span-7">
                  <Skeleton class="h-3 w-[full] rounded-full bg-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button class="justify-self-center" @click="meta_import.import_meta_page()">Import</Button>
      </section>
    </DialogContent>
  </Dialog>
</template>
