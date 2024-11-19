<script lang="ts" setup>
import CreateTeam from './components/CreateTeam.vue'
import CreateWorkspace from './components/CreateWorkspace.vue'
import CreateTeam from '../modules/teams-permissions/components/team/CreateTeam.vue'
import Button from '@/core/components/ui/button/Button.vue'
import { reactive, ref } from 'vue'

//Opens createWorkspace Component
const new_workspace_modal = ref(false)
function new_workspace_return() {
  new_workspace_modal.value = false
}

const new_team_modal = ref(false)
function new_team_return() {
  new_team_modal.value = false
}
</script>

<template>
  <div class="flex flex-col items-start justify-normal gap-2">
    <Button @click="new_workspace_modal = !new_workspace_modal">Create new Workspace</Button>
    <Button @click="new_team_modal = !new_team_modal">Create a team</Button>
  </div>
  <CreateWorkspace :open_modal="new_workspace_modal" @return="new_workspace_return" />
  <CreateTeam :open_modal="new_team_modal" @return="new_team_return" />
</template>
