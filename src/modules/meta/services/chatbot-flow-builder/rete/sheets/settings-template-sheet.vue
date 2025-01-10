<script setup lang="ts">
import { nodeIconMapping } from '../utils'
import { Button } from '@/core/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import type { NodeType } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'

const nodeMapping: Record<
  keyof Omit<NodeType, 'reference_node'>,
  { label: string; onClick(): void }
> = {
  message_node: {
    label: 'Message',
    onClick() {
      alert('message!')
    },
  },
  generic_node: {
    label: 'Generic',
    onClick() {
      alert('message!')
    },
  },
  carousel_node: {
    label: 'Carousel',
    onClick() {
      alert('message!')
    },
  },
  media_node: {
    label: 'Media',
    onClick() {
      alert('message!')
    },
  },
  condition_node: {
    label: 'Condition',
    onClick() {
      alert('message!')
    },
  },
  trigger_node: {
    label: 'Trigger',
    onClick() {
      alert('message!')
    },
  },
  audio_node: {
    label: 'Audio',
    onClick() {
      alert('message!')
    },
  },
  image_node: {
    label: 'Image',
    onClick() {
      alert('message!')
    },
  },
}
</script>

<template>
  <header class="flex items-center justify-between border-b p-3">
    <span class="flex items-center gap-x-2">
      <Icon icon="tabler:zoom" class="size-5" />
      300%
    </span>
    <span class="flex items-center gap-x-2">
      <Button type="button" class="bg-green-500 hover:bg-green-600" size="xs">Publish</Button>
      <Button type="button" class="bg-blue-500 hover:bg-blue-600" size="xs">Save</Button>
    </span>
  </header>
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
      <Button
        v-for="(node, key) in nodeMapping"
        :key
        type="button"
        variant="ghost"
        class="justify-start gap-x-2 rounded-none first:border-t"
        @click="node.onClick"
      >
        <Icon :icon="nodeIconMapping[key]" class="size-4" />
        {{ node.label }}
      </Button>
    </TabsContent>
  </Tabs>
</template>
