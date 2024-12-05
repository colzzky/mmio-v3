<script lang="ts" setup>
import CreateEditPost from './create-edit-post.vue'
import Button from '@/core/components/ui/button/Button.vue'
import DropdownMenu from '@/core/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuContent from '@/core/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/core/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/core/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import type {
  PostRandomizerPostsData,
  PostRandomizerServiceData,
} from '@/core/types/WorkSpaceTypes'
import { getWhereAny } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { onMounted, reactive, useTemplateRef } from 'vue'

const authWorkspaceStore = useAuthWorkspaceStore()
const createEditPostRef = useTemplateRef('createEditPost')
const createEditPostReturn = (data: PostRandomizerPostsData) => {
  if (campaign_contents.data.length > 0) {
    const data_index = campaign_contents.data.findIndex((post) => post.prp_id === data.prp_id)
    if (data_index !== -1) {
      campaign_contents.data[data_index] = data
      return
    }
  }
  campaign_contents.data.push(data)
  return
}
const { active_workspace, active_team } = authWorkspaceStore
const campaign_contents = reactive({
  data: [] as PostRandomizerPostsData[],
  fetchLoad: false as boolean,
  async fetchContents() {
    this.fetchLoad = true
    if (active_workspace.data) {
      const get = await getWhereAny('ws_post_randomizer_posts', {
        $path: 'workspaces/:ws_id/post_randomizer_service/:pr_id/post_randomizer_posts',
        $sub_params: { pr_id: props.campaign_data.pr_id, ws_id: active_workspace.data.ws_id },
      })
      this.data = get.data
    }
    this.fetchLoad = false
  },
})
const props = defineProps<{ campaign_data: PostRandomizerServiceData }>()

onMounted(async () => {
  await campaign_contents.fetchContents()
})
</script>

<template>
  <div>
    <div>
      <div class="">
        <div class="w-full space-y-4">
          <div class="flex items-center justify-end space-x-4">
            <Button variant="outline" size="icon">
              <i class="material-icons">view_list</i>
            </Button>
            <Button variant="outline" size="icon">
              <i class="material-icons">view_module</i>
            </Button>
            <Button
              @click="
                createEditPostRef?.modal.open({
                  intent: 'create',
                  prId: campaign_data.pr_id,
                  postData: null,
                })
              "
            >
              Create New Post
            </Button>
          </div>
          <div class="rounded-xl px-5">
            <div class="grid grid-cols-12 items-center">
              <div class="col-span-6 text-xs font-light">Post Name</div>
              <div class="col-span-3 text-xs font-light">Created By</div>
              <div class="col-span-2 text-xs font-light">Updated At</div>
              <div class="col-span-1 text-xs font-light"></div>
            </div>
          </div>

          <div v-if="!campaign_contents.fetchLoad" class="py-2">
            <div v-if="campaign_contents.data.length">
              <div
                v-for="post in campaign_contents.data"
                :key="post.prp_id"
                class="cursor-pointer rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300"
              >
                <div class="grid grid-cols-12 items-center">
                  <div class="col-span-6">
                    <div class="flex items-center gap-x-3">
                      <i class="bx bx-google text-2xl"></i>
                      <div class="grid gap-0">
                        <span class="text-sm">{{ post.postName }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-span-3 flex flex-col">
                    <span class="text-sm">
                      {{
                        post.createdBy
                          ? active_team.members[post.createdBy].displayName
                          : post.createdBy
                      }}
                    </span>
                  </div>
                  <div class="col-span-2 flex flex-col">
                    <span class="text-sm">
                      {{ uiHelpers.formatDateTimeAgo(post.updatedAt) }}
                    </span>
                  </div>
                  <div class="col-span-1 flex justify-end">
                    <div class="grid place-content-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <i class="material-icons text-md">more_vert</i>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem class="gap-x-3">
                            <i class="bx bx-edit text-xl" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            class="gap-x-3"
                            @click="
                              createEditPostRef?.modal.open({
                                intent: 'edit',
                                prId: campaign_data.pr_id,
                                postData: post,
                              })
                            "
                          >
                            <i class="bx bx-edit text-xl" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>No available data.</div>
          </div>

          <div v-else class="rounded-xl px-2 py-4">
            <div class="grid grid-cols-12 items-center space-y-3">
              <div class="col-span-5">
                <Skeleton class="h-3 w-[300px] rounded-full bg-gray-300" />
              </div>
              <div class="col-span-7">
                <Skeleton class="h-3 w-[full] rounded-full bg-gray-300" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2">
            <Button variant="outline" size="xs"> Sample Load More </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <CreateEditPost ref="createEditPost" @return="createEditPostReturn" />
</template>
