<script setup lang="ts">
import DesktopSidebar from '@/core/components/sidebar/desktop-sidebar.vue'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore';
import { onMounted } from 'vue';
import router from '@/router'
import { useRoute } from 'vue-router';
import { useWorkspaceStore } from '@/stores/WorkspaceStore';
import { useTeamStore } from '@/stores/teamStore';
import { getWhereAny } from '../utils/firebase-collections';
import { useAuthStore } from '@/stores/authStore';
import { accessPermission } from '../utils/permissionHelpers';
import Button from '../components/ui/button/Button.vue';
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
const { active_workspace, active_team, current_member,returnHome } = authWorkspaceStore
const { workspace: wp_model } = workspaceStore
const { team } = teamStore
const { user_auth } = authStore
const { workspaceOwner } = accessPermission

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
  if (active_workspace.data && user_auth.data) {
    const userId = user_auth.data.uid;
    const get_team = await team.get(active_workspace.data.team_id)
    if (get_team.status) {
      if (get_team.data) {
        if (!workspaceOwner(active_workspace.data)) {
          console.log(get_team.data.team_members)
          if (get_team.data.team_members) {
            const check_member = get_team.data.team_members.find((member) => member.uid === userId)
            
            if (check_member) {
              await current_member.listen(active_workspace.data.team_id, check_member.member_id)
            } else {
              //await router.push({ name: 'home' })
            }
            active_team.data = JSON.parse(JSON.stringify(active_team.data))
          } else {
           // await router.push({ name: 'home' })
          }
        }
      }
    }
  }
}



onMounted(async () => {
  await validateWorkspace()
  await validateMemberOwner()
})


</script>

<template>
  <DesktopSidebar />
  <div class="lg:pl-72">
    {{ current_member.data }}
    <Button @click="returnHome()">Unlisten</Button>
    <RouterView />
  </div>
</template>
