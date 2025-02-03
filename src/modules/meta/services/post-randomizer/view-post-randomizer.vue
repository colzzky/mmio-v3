<script lang="ts" setup>
import EditCampaignInfo from './components/edit-campaign-info.vue'
import PostContent from './components/posts-content.vue'
import Button from '@/core/components/ui/button/Button.vue'
import Main from '@/core/components/ui/main.vue'
import type { TransformedTimezone } from '@/core/types/UniTypes'
import { type PostRandomizerServiceData } from '@/core/types/WorkSpaceTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { getCollection } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import router from '@/router'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
const timezoneList = ref<TransformedTimezone[]>([])

interface PostRandomizer {
  data: PostRandomizerServiceData | null
  posts: string[]
  fetchLoad: boolean
  getCampaign: () => Promise<void>
}

enum CampaignInterface {
  INFO_VIEW = 'CampaignInfoView',
  INFO_UPDATE = 'CampaignInfoUpdate',
  POST_UPDATE = 'CampaignPostUpdate',
}

const route = useRoute()
const authWorkspaceStore = useAuthWorkspaceStore()
const { workspace_service, service_models, active_workspace } = authWorkspaceStore
const randomizer_id = route.params.randomizer_id as string
const campaignInterface = ref<CampaignInterface>(CampaignInterface.INFO_VIEW)

const campaign = reactive<PostRandomizer>({
  data: null,
  posts: [],
  fetchLoad: false,
  async getCampaign(): Promise<void> {
    this.fetchLoad = true
    if (workspace_service.post_randomizer.data && active_workspace.data) {
      const find_campaign = workspace_service.post_randomizer.data.find(
        (campaign) => campaign.pr_id === randomizer_id,
      )
      if (find_campaign) {
        this.data = { ...find_campaign }
        this.fetchLoad = false
        return
      }
    }
    
    const get = await getCollection(DbCollections.ws_post_randomizer, {
      id:randomizer_id,
      $sub_params:{
        ws_id:route.params.ws_id as string
      }
    })
    if (get.status && get.data) {
      this.data = { ...get.data }
      this.fetchLoad = false
      return
    } else {
      this.fetchLoad = false
    }
  },
})

function find_timezone(text: string) {
  const find = timezoneList.value.find((timezone) => timezone.text === text)
  return find
}

function editCampaignInfoReturn(data: PostRandomizerServiceData | null) {
  if (data) {
    campaign.data = { ...data }
  }
  campaignInterface.value = CampaignInterface.INFO_VIEW
}

onMounted(async () => {
  if (randomizer_id) {
    await campaign.getCampaign()
    timezoneList.value = await uiHelpers.timezoneList()
  }
})
</script>
<template>
  <Main class="container mx-auto">
    <div v-if="!campaign.fetchLoad">
      <div v-if="campaign.data">
        <!-- {{ campaign_form.errors }} -->
        <div v-if="campaignInterface !== CampaignInterface.INFO_UPDATE" class="space-y-5">
          <div class="space-y-5">
            <div class="flex items-center justify-start space-x-2">
              <Button variant="ghost" class="flex" @click="router.go(-1)"
                ><i class="material-icons text-md">arrow_back</i></Button
              >
              <span class="text-xl font-bold">{{ campaign.data.name }}</span>
            </div>
            <div class="flex justify-start">
              <Button
                variant="outline"
                class="w-[20vh] rounded-r-none border-r-0"
                :class="{
                  'bg-gray-100 font-bold': campaignInterface === CampaignInterface.INFO_VIEW,
                }"
                @click="campaignInterface = CampaignInterface.INFO_VIEW"
                >Campaign Details</Button
              >
              <Button
                variant="outline"
                class="w-[20vh] rounded-l-none"
                :class="{
                  'bg-gray-100 font-bold': campaignInterface === CampaignInterface.POST_UPDATE,
                }"
                @click="campaignInterface = CampaignInterface.POST_UPDATE"
                >Campaign Contents/Post</Button
              >
            </div>
          </div>

          <div
            v-if="campaignInterface === CampaignInterface.INFO_VIEW"
            class="rounded-lg border border-gray-200 bg-gray-100"
          >
            <div class="flex flex-col gap-y-4 p-4">
              <div class="flex justify-between">
                <span class="text-lg font-bold">Campaign Information</span>
                <Button
                  variant="outline"
                  class="w-[20vh] rounded-r-none border-r-0"
                  @click="campaignInterface = CampaignInterface.INFO_UPDATE"
                  >Edit Campaign Information</Button
                >
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col">
                    <span class="font-bold">Campaign Name</span>
                    <span class="">{{ campaign.data.name }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Timezone</span>
                    <span class="">{{
                      campaign.data.timezone
                        ? find_timezone(campaign.data.timezone)?.text
                        : 'Not yet added'
                    }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Frequency</span>
                    <span class="">{{ campaign.data.frequency }}</span>
                  </div>
                  <div
                    v-if="
                      campaign.data.frequency === 'Weekly' || campaign.data.frequency === 'Monthly'
                    "
                    class="flex flex-col"
                  >
                    <span class="font-bold">Weekly</span>

                    <div class="flex w-full flex-row flex-wrap items-center gap-2 py-2">
                      <div
                        v-for="day in campaign.data.weekly"
                        :key="day"
                        class="flex items-center space-x-2 self-start rounded-full border border-gray-300 bg-gray-200 p-1 px-3 text-xs"
                      >
                        <span class="text-sm font-semibold">{{ day }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="campaign.data.frequency === 'Monthly'" class="flex flex-col">
                    <span class="font-bold">Monthly</span>
                    <div class="flex w-full flex-row flex-wrap items-center gap-2 py-2">
                      <div
                        v-for="month in campaign.data.monthly"
                        :key="month"
                        class="flex items-center space-x-2 self-start rounded-full border border-gray-300 bg-gray-200 p-1 px-3 text-xs"
                      >
                        <span class="text-sm font-semibold">{{ month }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Time to post</span>
                    <div v-if="campaign.data.time.length > 0">
                      <div class="flex w-full flex-row flex-wrap items-center gap-2 py-2">
                        <div
                          v-for="time in campaign.data.time"
                          :key="time"
                          class="flex items-center space-x-2 self-start rounded-full bg-blue-500 px-3 py-1"
                        >
                          <span v-if="time" class="text-sm font-semibold text-white">{{
                            uiHelpers.convertTimeToReadableFormat(time)
                          }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-else>Not Yet Available</div>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Start Date</span>
                    <div v-if="campaign.data.startDate && campaign.data.endDate">
                      <span class=""
                        >{{ new Date(campaign.data.startDate).toDateString() }} -
                        {{ new Date(campaign.data.endDate).toDateString() }}</span
                      >
                    </div>
                    <div v-else>Not Yet Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="campaignInterface === CampaignInterface.POST_UPDATE">
            <PostContent :campaign_data="campaign.data" />
          </div>
        </div>

        <div v-else>
          <EditCampaignInfo :campaign_data="campaign.data" @return="editCampaignInfoReturn" />
        </div>
      </div>
      <div v-else>Nothing Found here</div>
    </div>
    <div v-else class="flex flex-col items-center justify-center">
      <div class="flex items-center justify-center space-x-2">
        <i class="material-icons animate-spin text-2xl">donut_large</i>
      </div>
    </div>
  </Main>
</template>
