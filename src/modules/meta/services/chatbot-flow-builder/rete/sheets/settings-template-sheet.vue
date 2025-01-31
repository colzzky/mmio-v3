<script setup lang="ts">
import { nodeIconMapping } from '../utils'
import { Button } from '@/core/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { nodeMapContextMenu, ReteTemplates, type AreaExtra, type NodeType, type Schemes } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { Area, AreaExtensions, AreaPlugin } from 'rete-area-plugin'
const authWorkspace = useAuthWorkspaceStore()
const { active_flow } = authWorkspace
const { rete_init } = active_flow
const { draggable } = rete_init

const nodeMapping: Record<keyof Omit<typeof nodeMapContextMenu, 'reference'>, 
  { label: string; icon:string, onClick(): void }> = 
  Object.entries(nodeMapContextMenu)
  .reduce((acc, [key, { label, icon, template }]) => {
    if (template !== 'reference_node') {
      acc[key as keyof Omit<typeof nodeMapContextMenu, 'reference'>] = {
        label,
        icon,
        async onClick() {
          draggable.toggleNode(ReteTemplates.node_templates[template]());
        }
      };
    }
    return acc;
  }, {} as Record<keyof Omit<typeof nodeMapContextMenu, 'reference'>, { label: string; onClick(): void, icon:string }>);

</script>

<template>
  <Tabs default-value="settings">
    <TabsList class="mx-2 mt-2 flex justify-start">
      <TabsTrigger value="settings">Settings</TabsTrigger>
      <TabsTrigger value="node-templates">Node Templates</TabsTrigger>
    </TabsList>
    <TabsContent value="settings" class="grid">
      <Button type="button" variant="ghost" class="justify-start gap-x-2 rounded-none border-t">
        <Icon icon="bx:send" class="size-4" />
        Send Test
      </Button>
      <Button type="button" variant="ghost" class="justify-start gap-x-2 rounded-none">
        <Icon icon="hugeicons:arrange" class="size-4" />
        Arrange Nodes
      </Button>
      <Button type="button" variant="ghost" class="justify-start gap-x-2 rounded-none">
        <Icon icon="mingcute:ai-line" class="size-4" />
        Generate Node AI
      </Button>
    </TabsContent>
    <TabsContent value="node-templates" class="grid">
      <Button v-for="(node, key) in nodeMapping" :key type="button" variant="ghost"
        class="justify-start gap-x-2 rounded-none first:border-t" @click="node.onClick">
        <Icon :icon="nodeMapContextMenu[key].icon" class="size-4" />
        {{ node.label }}
      </Button>
    </TabsContent>
  </Tabs>
</template>
