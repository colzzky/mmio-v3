<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import type { UserData } from '@/core/types/AuthUserTypes'
import type { TeamData } from '@/core/types/TeamTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { getWhereAny } from '@/core/utils/firebase-collections'
import CreateTeam from '@/modules/teams-permissions/components/team/CreateTeam.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { objectEntries } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

const authStore = useAuthStore()
const { user_auth, user_team_refs, user_details: ud } = authStore
const pageLoad = ref<boolean>(true)

const new_team_modal = ref(false)
async function new_team_return(team_data: TeamData | null) {
  new_team_modal.value = false
  pageLoad.value = true
  if (team_data && team_data.tm_id && user_team_refs.data) {
    user_team_refs.data[team_data.tm_id] = {team:team_data,members:[]}
    await fetch_owners()
  }
  pageLoad.value = false
}

async function fetch_owners() {
  pageLoad.value = true
  if (!ud.team_owners && user_team_refs.data) {
    console.log('refetching again')

    objectEntries(user_team_refs.data).forEach(([key, data]) => {
      if (!ud.team_owners_uid.includes(data.team.owner_uid)) {
        if (!ud.team_owners_uid.find((uid) => uid === data.team.owner_uid)) {
          ud.team_owners_uid.push(data.team.owner_uid)
        }
      }
    })

    const fetch_owners = await getWhereAny(DbCollections.users, {
      whereConditions: [
        {
          fieldName: 'uid',
          operator: 'in',
          value: ud.team_owners_uid,
        },
      ],
    })

    if (fetch_owners.status) {
      const owners: { [key: string]: UserData } = {}
      fetch_owners.data.forEach((data) => {
        owners[data.uid] = data
      })
      ud.team_owners = { ...owners }
    }
  }
  pageLoad.value = false
}

onMounted(async () => {
  if (user_team_refs.isInitialized) {
    if (user_team_refs.data && objectEntries(user_team_refs.data).length > 0) {
      await fetch_owners()
    }
    pageLoad.value = false
  }
})

watch(
  () => user_team_refs.isInitialized,
  async (initlized) => {
    console.log('watching')
    if (initlized) {
      if (user_team_refs.data  && objectEntries(user_team_refs.data).length > 0) await fetch_owners()
      pageLoad.value = false
    }
    // Perform additional actions if needed when myData changes
  },
)
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="text-lg font-bold">Your Teams</div>
      <Button
        @click="new_team_modal = !new_team_modal"
        variant="ghost"
        class="font-bold text-blue-500"
        >Create a team</Button
      >
    </div>
    <div>
      <div class="">
        <div class="w-full py-4">
          <div class="rounded-xl px-5">
            <div class="grid grid-cols-12 items-center">
              <div class="col-span-6 text-xs font-light">Name</div>
              <div class="col-span-3 text-xs font-light">Permission</div>
              <div class="col-span-2 text-xs font-light">Owner</div>
              <div class="col-span-1 text-xs font-light"></div>
            </div>
          </div>
          <div v-if="!user_team_refs.isLoading && !pageLoad" class="py-2">
            <div v-if="user_team_refs.data && ud.team_owners">
              <div
                v-for="data in user_team_refs.data"
                :key="data.team.tm_id"
                class="cursor-pointer rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300"
              >
                <div class="grid grid-cols-12 items-center">
                  <div
                    class="col-span-6"
                    @click="router.push({ name: 'team-view', params: { team_id: data.team.tm_id } })"
                  >
                    <div class="flex items-center gap-x-3">
                      <i class="bx bx-google text-2xl"></i>
                      <div class="grid gap-0">
                        <span class="text-sm">{{ data.team.name }}</span>
                        <span class="text-xs">{{ data.members.length }} Members</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-span-3 text-sm text-gray-600">
                    {{ `read and write` }}
                  </div>
                  <div class="col-span-2 flex flex-col">
                    <span class="text-sm font-bold">
                      {{
                        ud.team_owners[data.team.owner_uid].uid === user_auth.data?.uid
                          ? `${ud.team_owners[data.team.owner_uid].displayName} (You)`
                          : ud.team_owners[data.team.owner_uid].displayName
                      }}
                    </span>
                    <span class="text-xs text-gray-600">{{
                      ud.team_owners[data.team.owner_uid].email
                    }}</span>
                  </div>
                  <div class="col-span-1 flex justify-end">
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
  <CreateTeam :open_modal="new_team_modal" @return="new_team_return" />
</template>
