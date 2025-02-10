<script setup lang="ts">
import Toaster from '../components/ui/toast/Toaster.vue'
import type { TeamData, TeamMembersData } from '../types/TeamTypes'
import { getCollection, getCollectionWithSubcollections, getWhereAny } from '../utils/firebase-collections'
import { accessPermission } from '../utils/permissionHelpers'
import DesktopSidebar from '@/core/components/sidebar/desktop-sidebar.vue'
import router from '@/router'
import { useWorkspaceStore } from '@/stores/WorkspaceStore'
import { useAuthStore } from '@/stores/authStore'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { useTeamStore } from '@/stores/teamStore'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Dashboard from '@/modules/meta/services/dashboard/page.vue'
import { DbCollections } from '../utils/enums/dbCollection'
import type { ActiveTeam } from '../types/AuthWorkspaceTypes'

/**
 * Step 1: Check and validated workspace id if it exists on the firestore
 * Step 2: If it exists Check If Member or if the user is part of the member. If not redirect to homepage
 * Step 3: If everything is validate. Populate AuthWorkspace.store regarding the information of the workspace
 * Total Firstore fetch: 3
 */
const route = useRoute()
const workspace_id = route.params.workspaceId ? route.params.workspaceId : ('' as string)
const authWorkspaceStore = useAuthWorkspaceStore()
const workspaceStore = useWorkspaceStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const { active_workspace, active_team, current_member } = authWorkspaceStore
const { workspace } = workspaceStore
const { team } = teamStore
const { user_auth } = authStore
const { workspaceOwner } = accessPermission
const workspace_load = ref<boolean>(true)
const wp_model = workspace

async function validateWorkspace() {
  if (workspace_id) {
    const getWorkspace = await getCollectionWithSubcollections(DbCollections.workspaces, {
      id: workspace_id as string,
      subCollections: [[DbCollections.ws_meta_pages_refs]]
    })

    if (getWorkspace.status && getWorkspace.data) {
      active_workspace.data = getWorkspace.data.main
      active_workspace.meta_page_refs = getWorkspace.data.subCollections[DbCollections.ws_meta_pages_refs]
    } else {
      await router.push({ name: 'home' })
    }
  }
}

async function validateMemberOwner() {
  // Check prerequisites
  if (!active_workspace.data || !user_auth.data) {
    await router.push({ name: 'home' })
    return
  }

  const userId = user_auth.data.uid
  const teamId = active_workspace.data.team_id

  // Fetch team data
  const teamResponse = await getCollection(DbCollections.teams, {
    id: teamId,
  })
  let teamData: TeamData | null = null
  let teamMembers: TeamMembersData[] = []

  // Check team data validity
  if (teamResponse.status && teamResponse.data) {
    teamData = teamResponse.data
  }

  // Check workspace ownership
  if (workspaceOwner(active_workspace.data) && teamData) {
    active_team.data = {
      team: teamData,
      members: []
    }
    //Populate team member when visiting a member tab
    //await populateTeamMembers()
    return // Valid owner, exit function
  }

  if (teamData && teamMembers.length > 0) {
    const member = teamMembers?.find((m) => m.uid === userId)

    // Check membership
    if (!member) {
      await router.push({ name: 'home' })
      return
    }

    // Listen for current member updates
    await current_member.listen(teamId, member.member_id)
    active_team.data = {
      team: teamData,
      members: teamMembers
    }
    await populateTeamMembers()
    return
  }
}

async function populateTeamMembers() {
  if (active_team.data) {
    const members_uid: string[] = active_team.data.members.map(item => item.uid)

    const find_members_info = await getWhereAny(DbCollections.users, {
      whereConditions: [
        {
          fieldName: 'uid',
          operator: 'in',
          value: members_uid,
        },
      ],
    })

    if (find_members_info.status && find_members_info.data.length > 0) {
      active_team.members = find_members_info.data.reduce((acc, item) => {
        const member_data = active_team.data?.members.find((m) => m.uid === item.uid)
        if (member_data) {
          acc[item.uid] = {
            ...member_data,
            displayName: item.displayName ? item.displayName : '',
            email: item.email ? item.email : '',
            picture: item.photoURL ? item.photoURL : '',
          };
          return acc;
        } else {
          return acc
        }

      }, {} as ActiveTeam['members']);
    }
  }
}

onMounted(async () => {
  if (authStore.page_init.initialize) {
    workspace_load.value = true
    await validateWorkspace()
    await validateMemberOwner()
    workspace_load.value = false
  }
})

watch(
  () => authStore.page_init.initialize,
  async (newVal) => {
    if (newVal) {
      await validateWorkspace()
      await validateMemberOwner()
      workspace_load.value = false;
    }
  }, { immediate: true }
);
</script>

<template>
  <Toaster />
    <div v-if="!workspace_load">
      <div v-if="!(route.name === 'chatbot-flow-final')">
        <DesktopSidebar />

        <div class="lg:pl-72">

          <div v-if="route.name === 'workspace'">
            <Dashboard />
          </div>
          <div v-else>
            <RouterView v-slot="{ Component, route }">
              <transition name="zoom-fade" appear mode="out-in">
                <div :key="route.name">
                  <component :is="Component"></component>
                </div>
              </transition>
            </RouterView>
          </div>
        </div>
      </div>
      <div v-else>
        <RouterView />
      </div>
    </div>
    <div v-else class="flex h-screen flex-col items-center justify-center bg-gray-100">
      <div class="flex animate-pulse items-center gap-x-1">
        <i class="material-icons text-4xl">pin</i>
        <span class="text-xl font-extrabold">MMIO</span>
      </div>
      <div class="flex items-center justify-center space-x-2">
        <i class="material-icons animate-spin text-sm">donut_large</i>
        <div>Loading Workspace. Please wait.</div>
      </div>
    </div>
</template>
