<script lang="ts" setup>
import CreateWorkspace from './components/CreateWorkspace.vue'
import Button from '@/core/components/ui/button/Button.vue'
import { reactive, ref } from 'vue'

//Opens createWorkspace Component
const new_workspace_modal = ref(false)
function new_workspace_return() {
  console.log('test')
  new_workspace_modal.value = false
}
</script>

<template>
  <div class="flex flex-col items-start justify-normal gap-2">
    <Button @click="new_workspace_modal = !new_workspace_modal">Create new Workspace</Button>
    <Button>Create a team</Button>
  </div>
  <CreateWorkspace :open_modal="new_workspace_modal" @return="new_workspace_return" />
</template>
