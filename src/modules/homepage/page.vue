<script setup lang="ts">
import Workspaces from './components/Workspaces.vue'
import WorkspacesLoad from './components/WorkspacesLoad.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import AvatarDropdown from '@/core/components/ui/avatar-dropdown.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/core/components/ui/dropdown-menu'
import { Input } from '@/core/components/ui/input'
import type { UserData } from '@/core/types/AuthUserTypes'
import type { TeamData } from '@/core/types/TeamTypes'
import type { WorkspaceData } from '@/core/types/WorkSpaceTypes'
import { getWhereAny } from '@/core/utils/firebase-collections'
import CreateTeam from '@/modules/teams-permissions/components/team/CreateTeam.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const routes = useRoute()

const allWorkspaceFilter = ref('Most Recent')
const sharedWorkspaceFilter = ref('Most Recent')
const pageLoad = ref<boolean>(true)
const dataLoad = ref<boolean>(true)
const selectTeamLoad = ref<boolean>(true)
const authStore = useAuthStore()
const { user_auth, user, page_init } = authStore
const user_created_workspaces = ref<WorkspaceData[]>([])
const shared_workspaces = ref<WorkspaceData[]>([])
const workspace_owner_uid = ref<string[]>([])
const workspace_owners = ref<{ [key: string]: UserData }>({})
const team_refs_id: string[] = []
const user_teams = ref<TeamData[]>([])
const selected_team = ref<TeamData | null>(null)
const selected_team_workspaces = ref<WorkspaceData[]>([])
const new_team_modal = ref(false)

function new_team_return() {
  new_team_modal.value = false
}

async function fetch_workspaces() {
  if (user_auth.data) {
    if (user.data && user.data.team_refs) {
      const team_workspace = await getWhereAny('workspaces', {
        $path: 'workspaces',
        $sub_params: {},
        $sub_col: [],
        whereConditions: [
          { fieldName: 'team_id', operator: 'in', value: team_refs_id },
          { fieldName: 'owner_uid', operator: '!=', value: user_auth.data.uid },
        ],
      })

      if (team_workspace.data && team_workspace.status) {
        shared_workspaces.value = team_workspace.data
        team_workspace.data.forEach((workspace: WorkspaceData) => {
          workspace_owner_uid.value.push(workspace.owner_uid)
        })
      }
    }

    const personal_workspace = await getWhereAny('workspaces', {
      $path: 'workspaces',
      $sub_params: {},
      $sub_col: [],
      whereConditions: [{ fieldName: 'owner_uid', operator: '==', value: user_auth.data.uid }],
    })

    if (personal_workspace.data && personal_workspace.status) {
      user_created_workspaces.value = personal_workspace.data
    }

    console.log(user_created_workspaces.value)
    console.log(shared_workspaces.value)
  }
}

async function fetch_workspace_owners() {
  if (workspace_owner_uid.value.length > 0) {
    const get_users = await getWhereAny('user', {
      $path: 'users',
      $sub_params: {},
      $sub_col: [],
      whereConditions: [{ fieldName: 'uid', operator: 'in', value: workspace_owner_uid.value }],
    })

    if (get_users.status) {
      workspace_owners.value = get_users.data.reduce(
        (acc: { [key: string]: UserData }, current: UserData) => {
          acc[current.uid] = { ...current } // Create a shallow copy
          return acc
        },
        {},
      )
    }
  }
}

async function fetch_teams() {
  if (user_auth.data) {
    console.log(user)

    if (user.data && user.data.team_refs) {
      console.log('ente2')
      user.data.team_refs.forEach((team) => {
        team_refs_id.push(team.tm_id)
      })
      const team = await getWhereAny('team', {
        $path: 'teams',
        whereConditions: [{ fieldName: 'tm_id', operator: 'in', value: team_refs_id }],
      })
      console.log('tesm list')
      console.log(team)
      if (team.data && team.status) {
        console.log('ente3')
        user_teams.value = team.data
      }
    }
  }
}

async function select_team(team: TeamData | null) {
  if (team && user.data && user.data.team_refs) {
    selectTeamLoad.value = true
    const validate = user.data.team_refs.find((user_team) => user_team.tm_id === team.tm_id)
    if (validate) {
      selected_team.value = team
      const team_workspace = await getWhereAny('workspaces', {
        $path: 'workspaces',
        whereConditions: [
          { fieldName: 'team_id', operator: '==', value: selected_team.value.tm_id },
        ],
      })
      if (team_workspace.data && team_workspace.status) {
        selected_team_workspaces.value = team_workspace.data
      }
    } else {
      selected_team.value = null
    }
    selectTeamLoad.value = false
  } else {
    selected_team.value = null
    await fetch_all_workspaces()
  }
}

async function fetch_all_workspaces() {
  dataLoad.value = true
  await fetch_teams()
  await fetch_workspaces()
  await fetch_workspace_owners()
  dataLoad.value = false
}

onMounted(async () => {
  if (page_init.initialize) {
    pageLoad.value = true;
    
    pageLoad.value = false;
    await fetch_all_workspaces()
  }
})

watch(
  () => authStore.page_init.initialize,
  async (newVal) => {
    if (newVal) {
      pageLoad.value = false;
      await fetch_all_workspaces()
    }
  },{immediate:true}
);

</script>

<template>
  <div v-if="!pageLoad">
    <header class="flex items-center justify-between p-4">
      <DropdownMenu>
        <DropdownMenuTrigger class="flex items-center gap-x-1">
          <i class="material-icons text-5xl">pin</i>
          <div class="flex flex-col items-start">
            <strong class="text-xl leading-none">Marketing Master IO</strong>
            <small class="flex items-center">
              Team Workspace: {{ selected_team ? selected_team.name : 'All Workspace' }}
              <i class="material-icons">arrow_drop_down</i>
            </small>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="text-xs">
          <DropdownMenuItem v-for="team in user_teams" :key="team.tm_id" class="grid grid-cols-[40px_1fr] gap-x-3"
            @click="select_team(team)">
            <Avatar class="size-6 justify-self-center">
              <AvatarImage src="https://placehold.co/24" />
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
            {{ team.name }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="flex items-center gap-x-1" @click="select_team(null)">
            All Workspace
          </DropdownMenuItem>
          <DropdownMenuItem class="flex items-center gap-x-1" @click="new_team_modal = !new_team_modal">
            Create a Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="flex items-center gap-x-2 self-start">
        <button type="button" class="size-8 rounded hover:bg-primary/5">
          <i class="bx bx-bell text-xl" />
        </button>
        <AvatarDropdown />
      </div>
    </header>

    <main class="mx-auto grid max-w-screen-xl gap-y-12 p-4">
      <div class="relative mx-auto w-full max-w-screen-md">
        <span class="absolute inset-y-1 left-1 grid aspect-square place-content-center bg-white">
          <i class="bx bx-search" />
        </span>
        <Input type="search" placeholder="Search Workspace..." class="ps-10" />
      </div>
      <div v-if="!selected_team" class="space-y-10">
        <section class="grid gap-y-6">
          <div class="flex flex-col items-start text-xs">
            <h1
              class="bg-gradient-to-r from-gradient-purple to-gradient-red bg-clip-text text-xl font-bold text-transparent">
              Your Workspaces
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger>
                From {{ allWorkspaceFilter }}<i class="bx bx-caret-down" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup v-model="allWorkspaceFilter">
                  <DropdownMenuRadioItem value="Most Recent">Most Recent</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Filter #1">Filter #1</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Filter #2">Filter #2</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Transition name="fade" mode="out-in">
              <component :is="dataLoad ? WorkspacesLoad : Workspaces" :workspaces="user_created_workspaces"
                :is-shared="false" :workspace-owners="null" />
            </Transition>
          </div>
        </section>
        <section class="grid gap-y-6">
          <div class="flex flex-col items-start text-xs">
            <h1 class="bg-gradient-to-r from-[#1A7CFB] to-[#DA72F9] bg-clip-text text-xl font-bold text-transparent">
              Shared Workspaces
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger>
                From {{ sharedWorkspaceFilter }}<i class="bx bx-caret-down" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup v-model="sharedWorkspaceFilter">
                  <DropdownMenuRadioItem value="Most Recent">Most Recent</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Filter #1">Filter #1</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Filter #2">Filter #2</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Transition name="fade" mode="out-in">
              <component :is="dataLoad ? WorkspacesLoad : Workspaces" :workspaces="shared_workspaces" :is-shared="true"
                :workspace-owners="workspace_owners" />
            </Transition>
          </div>
        </section>
      </div>
      <div v-else>
        <section class="grid gap-y-6">
          <div class="flex flex-col items-start text-xs">
            <h1 class="bg-gradient-to-r from-[#1A7CFB] to-[#DA72F9] bg-clip-text text-xl font-bold text-transparent">
              {{ `${selected_team.name} Workspaces` }}
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger>
                From {{ sharedWorkspaceFilter }}<i class="bx bx-caret-down" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup v-model="sharedWorkspaceFilter">
                  <DropdownMenuRadioItem value="Most Recent">Most Recent</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Filter #1">Filter #1</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Filter #2">Filter #2</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Transition name="fade" mode="out-in">
              <component :is="selectTeamLoad ? WorkspacesLoad : Workspaces" :workspaces="selected_team_workspaces"
                :is-shared="true" :workspace-owners="workspace_owners" />
            </Transition>
          </div>
        </section>
      </div>
    </main>
    <CreateTeam :open_modal="new_team_modal" @return="new_team_return" />
  </div>
  <div v-else class="flex h-screen flex-col items-center justify-center bg-gray-100">
    <div class="flex animate-pulse items-center gap-x-1">
      <i class="material-icons text-4xl">pin</i>
      <span class="text-xl font-extrabold">MMIO</span>
    </div>
    <div class="flex items-center justify-center space-x-2">
      <i class="material-icons animate-spin text-sm">donut_large</i>
      <div>Loading</div>
    </div>
  </div>

  
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
