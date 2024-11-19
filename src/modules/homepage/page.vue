<script setup lang="ts">
import { authedUserName, workspaces } from './temporaries'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Button } from '@/core/components/ui/button'
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
import CreateTeam from '@/modules/teams-permissions/components/team/CreateTeam.vue'
import CreateWorkspace from '@/views/components/CreateWorkspace.vue'
import { computed, ref } from 'vue'

const workspacesRef = ref(workspaces)
const userWorkspaces = computed(() =>
  workspacesRef.value.filter(({ author }) => author === authedUserName),
)
const sharedWorkspaces = computed(() =>
  workspacesRef.value.filter(({ author }) => author !== authedUserName),
)

const allWorkspaceFilter = ref('Most Recent')
const sharedWorkspaceFilter = ref('Most Recent')

const newWorkspaceModal = ref(false)
function newWorkspaceReturn() {
  newWorkspaceModal.value = false
}

const new_team_modal = ref(false)
function new_team_return() {
  new_team_modal.value = false
}
</script>

<template>
  <header class="flex items-center justify-between p-4">
    <DropdownMenu>
      <DropdownMenuTrigger class="flex items-center gap-x-1">
        <i class="material-icons text-5xl">pin</i>
        <div class="flex flex-col items-start">
          <strong class="text-xl leading-none">Marketing Master IO</strong>
          <small class="flex items-center">
            Team Workspace: All workspaces
            <i class="material-icons">arrow_drop_down</i>
          </small>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="text-xs">
        <DropdownMenuItem class="grid grid-cols-[40px_1fr] gap-x-3">
          <Avatar class="size-6 justify-self-center">
            <AvatarImage src="https://placehold.co/24" />
            <AvatarFallback>UI</AvatarFallback>
          </Avatar>
          My Workspace
        </DropdownMenuItem>
        <DropdownMenuItem class="grid grid-cols-[40px_1fr] gap-x-3">
          <div class="relative">
            <Avatar class="absolute left-0 top-0 size-6 -translate-y-1/2">
              <AvatarImage src="https://placehold.co/24" />
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
            <Avatar class="absolute left-4 top-0 size-6 -translate-y-1/2">
              <AvatarFallback>+14</AvatarFallback>
            </Avatar>
          </div>
          Paul's Team
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          class="flex items-center gap-x-1"
          @click="new_team_modal = !new_team_modal"
        >
          Create a Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <div class="flex items-center gap-x-2 self-start">
      <Button variant="ghost" size="xs">
        <i class="material-icons text-md">notifications</i>
      </Button>
      <Avatar class="size-8">
        <AvatarImage src="https://placehold.co/48" />
        <AvatarFallback>UI</AvatarFallback>
      </Avatar>
    </div>
  </header>

  <main class="mx-auto grid max-w-screen-xl gap-y-12 p-4">
    <div class="relative mx-auto w-full max-w-screen-md">
      <span class="absolute inset-y-1 left-1 grid aspect-square place-content-center bg-white">
        <i class="bx bx-search" />
      </span>
      <Input type="search" placeholder="Search Workspace..." class="ps-10" />
    </div>
    <section class="grid gap-y-6">
      <div class="flex flex-col items-start text-xs">
        <h1
          class="bg-gradient-to-r from-gradient-purple to-gradient-red bg-clip-text text-xl font-bold text-transparent"
        >
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
      <div class="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
        <button
          class="relative flex flex-col rounded-lg bg-white [--border-width:2px] before:absolute before:-inset-[var(--border-width)] before:-z-10 before:rounded-[calc(theme(borderRadius.lg)+var(--border-width))] before:bg-gradient-to-b before:from-gradient-purple before:to-gradient-red after:absolute after:-inset-[var(--border-width)] after:-z-10 after:rounded-[calc(theme(borderRadius.lg)+var(--border-width))] after:bg-gradient-to-b after:from-gradient-purple after:to-gradient-red after:blur-sm"
          @click="newWorkspaceModal = !newWorkspaceModal"
        >
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
        <RouterLink
          v-for="workspace in userWorkspaces"
          :key="workspace.id"
          :to="`/workspace/${workspace.id}/meta`"
          class="flex flex-col rounded-lg border border-primary/25"
        >
          <div class="self-center py-4">
            <Avatar class="size-16">
              <AvatarImage src="https://placehold.co/64" />
            </Avatar>
          </div>
          <div class="flex flex-col items-center justify-between border-t py-3 text-sm">
            <h3 class="font-medium">{{ workspace.workspaceName }}</h3>
            <small>By: {{ workspace.author }}</small>
          </div>
        </RouterLink>
      </div>
    </section>
    <section class="grid gap-y-6">
      <div class="flex flex-col items-start text-xs">
        <h1
          class="bg-gradient-to-r from-[#1A7CFB] to-[#DA72F9] bg-clip-text text-xl font-bold text-transparent"
        >
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
      <div class="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
        <RouterLink
          v-for="workspace in sharedWorkspaces"
          :key="workspace.id"
          :to="`/workspace/${workspace.id}/meta`"
          class="flex flex-col rounded-lg border border-primary/25"
        >
          <div class="self-center py-4">
            <Avatar class="size-16">
              <AvatarImage src="https://placehold.co/64" />
            </Avatar>
          </div>
          <div class="flex flex-col items-center justify-between border-t py-3 text-sm">
            <h3 class="font-medium">{{ workspace.workspaceName }}</h3>
            <small>By: {{ workspace.author }}</small>
          </div>
        </RouterLink>
      </div>
    </section>
  </main>

  <CreateWorkspace :open_modal="newWorkspaceModal" @return="newWorkspaceReturn" />
  <CreateTeam :open_modal="new_team_modal" @return="new_team_return" />
</template>
