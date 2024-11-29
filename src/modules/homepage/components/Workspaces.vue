<script setup lang="ts">
import Avatar from '@/core/components/ui/avatar/Avatar.vue';
import AvatarImage from '@/core/components/ui/avatar/AvatarImage.vue';
import type { UserData } from '@/core/types/AuthUserTypes';
import type { WorkspaceData } from '@/core/types/WorkSpaceTypes';
import { useAuthStore } from '@/stores/authStore';
import CreateWorkspace from '@/views/components/CreateWorkspace.vue';
import { ref } from 'vue';
const authStore = useAuthStore()
const { user } = authStore

const props = defineProps<{ workspaces: WorkspaceData[], isShared: boolean, workspaceOwners:{[key: string]: UserData}|null}>()

const newWorkspaceModal = ref(false)
function newWorkspaceReturn(workspace: WorkspaceData | null) {
    if (workspace) {
        console.log(workspace)
        props.workspaces.push(workspace)
    }
    newWorkspaceModal.value = false
}
</script>
<template>
    <div>
        <div class="grid auto-rows-fr grid-cols-4 gap-8">
            <button v-if="!isShared"
                class="relative flex flex-col rounded-lg bg-white [--border-width:2px] before:absolute before:-inset-[var(--border-width)] before:-z-10 before:rounded-[calc(theme(borderRadius.lg)+var(--border-width))] before:bg-gradient-to-b before:from-gradient-purple before:to-gradient-red after:absolute after:-inset-[var(--border-width)] after:-z-10 after:rounded-[calc(theme(borderRadius.lg)+var(--border-width))] after:bg-gradient-to-b after:from-gradient-purple after:to-gradient-red after:blur-sm"
                @click="newWorkspaceModal = !newWorkspaceModal">
                <div class="self-center py-4">
                    <img src="@/assets/undraw_add_files.svg" alt="" class="size-16" />
                </div>
                <div class="flex w-full flex-col items-center justify-between border-t py-3 text-sm">
                    <h3 class="font-medium">Create a Workspace</h3>
                    <small class="flex items-center gap-x-1">
                        <i class="bx bx-cog" /> Check out tutorial
                    </small>
                </div>
            </button>
            <RouterLink :to="{ name: 'workspace', params: { workspaceId: `${workspace.ws_id}` } }"
                v-if="workspaces.length > 0"
                v-for="workspace, workspace_index in workspaces" :key="workspace.ws_id"
                class="flex flex-col rounded-lg border border-gray-200 hover:bg-slate-100 bg-gray-50 cursor-pointer">
                <div class="self-center py-4">
                    <Avatar class="size-16">
                        <AvatarImage src="https://placehold.co/64" />
                    </Avatar>
                </div>
                <div class="flex flex-col items-center justify-between border-t py-3 text-sm">
                    <h3 class="font-medium">{{ workspace.name }}</h3>
                    <small>By: {{workspace.owner_uid === user.data?.uid ? user.data?.displayName: workspaceOwners ? workspaceOwners[workspace.owner_uid].displayName : ''}}</small>
                </div>
            </RouterLink>
            <div v-else>
                <div v-if="isShared">No available workspace</div>
            </div>
        </div>

        <CreateWorkspace :open_modal="newWorkspaceModal" @return="newWorkspaceReturn" />
    </div>
</template>