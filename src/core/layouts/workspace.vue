<script setup lang="ts">
import DesktopSidebar from '@/core/components/sidebar/desktop-sidebar.vue'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore';
import { onMounted, ref } from 'vue';
import router from '@/router'
import { useRoute } from 'vue-router';
import { useWorkspaceStore } from '@/stores/WorkspaceStore';
import { useTeamStore } from '@/stores/teamStore';
import { getWhereAny } from '../utils/firebase-collections';
import { useAuthStore } from '@/stores/authStore';
import { accessPermission } from '../utils/permissionHelpers';
import Button from '../components/ui/button/Button.vue';
import type { TeamData, TeamMembersData } from '../types/TeamTypes';
import Toaster from '../components/ui/toast/Toaster.vue';
/**
 * Step 1: Check and validated workspace id if it exists on the firestore
 * Step 2: If it exists Check If Member or if the user is part of the member. If not redirect to homepage
 * Step 3: If everything is validate. Populate AuthWorkspace.store regarding the information of the workspace
 * Total Firstore fetch: 3
 */
const route = useRoute();
const workspace_id = <string>route.params.workspaceId ? route.params.workspaceId : ''
const authWorkspaceStore = useAuthWorkspaceStore()
const workspaceStore = useWorkspaceStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const { active_workspace, active_team, current_member } = authWorkspaceStore
const { workspace: wp_model } = workspaceStore
const { team } = teamStore
const { user_auth } = authStore
const { workspaceOwner } = accessPermission
const workspace_load = ref<boolean>(true)


async function validateWorkspace() {

  if (workspace_id) {
    const get_workspace = await wp_model.get(workspace_id as string)
    if (get_workspace.status) {
      active_workspace.data = JSON.parse(JSON.stringify(get_workspace.data))
    } else {
      await router.push({ name: 'home' })
    }
  }

}

async function validateMemberOwner() {
  // Check prerequisites
  if (!active_workspace.data || !user_auth.data) {
    await router.push({ name: 'home' });
    return;
  }

  const userId = user_auth.data.uid;
  const teamId = active_workspace.data.team_id;

  // Fetch team data
  const teamResponse = await team.get(teamId);
  let teamData = <TeamData | null>null;
  let teamMembers = <TeamMembersData[]>[];

  // Check team data validity
  if (teamResponse.status) {
    teamData = teamResponse.data
    if (teamResponse.data && teamResponse.data.team_members) teamMembers = teamResponse.data.team_members
  }

  // Check workspace ownership
  if (workspaceOwner(active_workspace.data)) {
    active_team.data = teamData ? JSON.parse(JSON.stringify(teamData)) : null;
    return; // Valid owner, exit function
  }

  if (teamData && teamMembers.length > 0) {
    // Find member
    const member = teamMembers?.find((m) => m.uid === userId);

    // Check membership
    if (!member) {
      await router.push({ name: 'home' });
      return;
    }

    // Listen for current member updates
    await current_member.listen(teamId, member.member_id);
    active_team.data = JSON.parse(JSON.stringify(teamData));
  }
}

onMounted(async () => {
  workspace_load.value = true
  await validateWorkspace()
  await validateMemberOwner()
  workspace_load.value = false
})


</script>

<template>
  <Toaster />
  <div v-if="!workspace_load">
    <DesktopSidebar />
    <div class="lg:pl-72">
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
      <div>Loading</div>
    </div>
  </div>
</template>
