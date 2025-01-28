<script setup lang="ts">
import { nodeIconMapping } from '../utils'
import { Button } from '@/core/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { ReteTemplates, type AreaExtra, type NodeType, type Schemes } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { Area, AreaExtensions, AreaPlugin } from 'rete-area-plugin'
const authWorkspace = useAuthWorkspaceStore()
const { active_flow } = authWorkspace
const { rete_init } = active_flow
const { draggable } = rete_init

const nodeMapping: Record<keyof Omit<NodeType, 'reference_node'>, { label: string; onClick(): void }> = {
  message_node: {
    label: 'Message',
    async onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.message_node())
      // const event = new PointerEvent('contextmenu', {
      //   clientX: rete_init.area.area.pointer.x,
      //   clientY: rete_init.area.area.pointer.y
      // })
      // const node = ReteTemplates.node_templates.message_node()
      // await rete_init.editor.addNode(node);
      // await rete_init.area.translate(node.id, event);
      // AreaExtensions.zoomAt(rete_init.area as AreaPlugin<Schemes, AreaExtra>, [node.id]);
    }
  },
  generic_node: {
    label: 'Generic',
    onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.generic_node())
    },
  },
  carousel_node: {
    label: 'Carousel',
    onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.carousel_node())
    },
  },
  media_node: {
    label: 'Media',
    onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.media_node())
    },
  },
  condition_node: {
    label: 'Condition',
    onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.condition_node())
    },
  },
  trigger_node: {
    label: 'Trigger',
    onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.trigger_node())
    },
  },
  audio_node: {
    label: 'Audio',
    onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.audio_node())
    },
  },
  image_node: {
    label: 'Image',
    onClick() {
      draggable.toggleNode(ReteTemplates.node_templates.image_node())
    },
  },
}
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
        <Icon :icon="nodeIconMapping[key]" class="size-4" />
        {{ node.label }}
      </Button>
    </TabsContent>
  </Tabs>
</template>
