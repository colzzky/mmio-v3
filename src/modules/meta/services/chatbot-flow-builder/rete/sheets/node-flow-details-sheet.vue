<script setup lang="ts">
import { nodeIconMapping } from '../utils'
import AvatarDropdown from '@/core/components/ui/avatar-dropdown.vue'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { SheetContent } from '@/core/components/ui/sheet'
import Sheet from '@/core/components/ui/sheet/Sheet.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import type { Node, NodeType } from '@/modules/meta/utils/flow-types'
import router from '@/router'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const authWorkspace = useAuthWorkspaceStore()
const { active_flow , rete_init} = authWorkspace

function handleSelectNode<T extends keyof NodeType>(nodeId: Node<T>['id']) {
  active_flow.node_select(nodeId)
}

const searchNodeTerm = ref('')
const nodes = computed(() => {
  const nodes = rete_init.editor?.getNodes()
  if (!nodes) return []

  const filterRegex = new RegExp(searchNodeTerm.value, 'i')
  return nodes.filter((node) => node.data?.name.match(filterRegex))
})

const navigateBackChatBotFlow = () =>{
  router.back()
}
</script>

<template>
  <Sheet :modal="false" :open="!active_flow.ui.menuPanelMinimized">
    <SheetContent side="left"
      class="w-[clamp(300px,100%,15%)] gap-y-0 overflow-hidden overflow-y-scroll p-0 shadow-none [&>button]:hidden">
      <header class="grid gap-y-1.5 border-b p-2 text-sm">
        <div class="flex items-center justify-between gap-x-2">
          <div class="flex gap-x-1">
            <Button size="icon" variant="ghost" @click="navigateBackChatBotFlow()">
              <Icon icon="bx-left-arrow-alt" class="me-auto size-10" />
            </Button>
            
          <Icon icon="bxl:dev-to" class="me-auto size-10" />
        </div>
          <div class="flex gap-x-1">
            <AvatarDropdown />
            <Button size="icon" variant="ghost">
              <Icon @click="active_flow.ui.minimizeMenuPanel()" icon="mdi:arrow-vertical-collapse" class="size-5" />
            </Button>
          </div>

        </div>
        <h1 class="ps-1.5 font-bold leading-none">Flow Name</h1>
        <h2 class="ps-1.5 text-xs leading-none">Workspace Name</h2>
        <Badge class="ms-1.5 mt-1 place-self-start leading-none" variant="secondary">
          Team Name
        </Badge>
      </header>
      <Tabs default-value="node-list">
        <TabsList class="mx-2 mt-2 flex justify-start">
          <TabsTrigger value="node-list">Nodes</TabsTrigger>
          <TabsTrigger value="flow-details">Flow Details</TabsTrigger>
        </TabsList>
        <TabsContent value="node-list">
          <div class="relative [--gutter:theme(spacing.2)] [--icon-size:theme(spacing.5)]">
            <Icon icon="bx:search"
              class="absolute left-[var(--gutter)] top-1/2 size-[var(--icon-size)] -translate-y-1/2" />
            <Input v-model:model-value="searchNodeTerm" type="search" name="search" id="search"
              class="rounded-none border-x-0 ps-[calc(var(--gutter)+var(--icon-size)+var(--gutter))]" />
          </div>
          <!-- @note: have to declare explicitly height of header(123px) + tabs(48px) + search(48px) for the scrollarea to work -->
          <ScrollArea v-if="nodes.length > 0"
            class="h-[var(--height)] [--height:calc(100svh-(123px+48px+48px))] [&>div>div]:grid">
            <Button v-for="(node, key) in nodes" :key
              class="justify-start gap-x-2 rounded-none data-[selected=true]:bg-slate-200" variant="ghost"
              :data-selected="active_flow.selected_node_id === node.id" @click="handleSelectNode(node.id)">
              <Icon :icon="nodeIconMapping[node.label]" class="size-4" />
              {{ node.data?.name }}
            </Button>
          </ScrollArea>
          <section v-else class="p-4 text-center text-sm text-muted-foreground">
            No node available
          </section>
        </TabsContent>
        <TabsContent value="flow-details">Flow details here</TabsContent>
      </Tabs>
    </SheetContent>
  </Sheet>
  <transition name="slide-fade" mode="out-in">
    <div v-if="active_flow.ui.menuPanelMinimized" class="fixed top-0 left-0 p-4">
      <div
        class="w-[clamp(350px,100%,15%)] gap-y-0 overflow-hidden overflow-y-scroll p-0 shadow-none [&>button]:hidden bg-white rounded-lg">
        <header class="grid gap-y-1.5 border-b p-2 text-sm">
          <div class="flex items-center justify-between gap-x-2">
            <div class="flex gap-2 items-center">
              <div class="flex gap-x-1">
              <Button size="icon" variant="ghost" @click="navigateBackChatBotFlow()">
              <Icon icon="bx-left-arrow-alt" class="me-auto size-10" />
            </Button>
            </div>
              <Icon icon="bxl:dev-to" class="me-auto size-10" />
              <div class="">
                <h1 class="ps-1.5 font-bold leading-none truncate w-40">Flow Name Marketing Master IO Beta 1</h1>
                <h2 class="ps-1.5 text-xs leading-none truncate w-40">This is a test about marketing master io
                </h2>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <AvatarDropdown />
              <Button @click="active_flow.ui.minimizeMenuPanel()" size="icon" variant="ghost">
                <Icon icon="mdi:arrow-vertical-collapse" class="size-5" />
              </Button>
            </div>
          </div>
        </header>
      </div>
    </div>
  </transition>


</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
