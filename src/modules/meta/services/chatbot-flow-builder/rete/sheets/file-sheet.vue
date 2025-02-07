<script setup lang="ts">
import { nodeIconMapping } from '../utils'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { SheetHeader, SheetTitle, SheetDescription } from '@/core/components/ui/sheet'
import { toast } from '@/core/components/ui/toast'
import { Node } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { onMounted, ref, watch } from 'vue'

const authWorkspace = useAuthWorkspaceStore()
const { active_flow, rete_init } = authWorkspace

const localNodeData = ref<Node<'file_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(active_flow.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'file_node'>
})

watch(
  () => active_flow.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'file_node'>
    }
  },
)

function handleRemoveDelay() {
  if (!localNodeData.value?.data) return

  localNodeData.value.data.delay = '0'

  toast({
    title: 'Removed delay',
    variant: 'success',
    duration: 2000,
  })
}

function handleClearFileURL() {
  if (!localNodeData.value?.data) return

  localNodeData.value.data.file = ''

  toast({
    title: 'Cleared File URL',
    variant: 'success',
    duration: 2000,
  })
}
</script>

<template>
  <template v-if="localNodeData && localNodeData.data">
    <!-- default state -->
    <SheetHeader
      class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
    >
      <Icon
        :icon="nodeIconMapping[localNodeData.label]"
        class="row-span-full size-[var(--icon-size)] self-center"
      />
      <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
      <SheetDescription class="leading-none">File</SheetDescription>
    </SheetHeader>
    <main class="grid gap-y-4 px-6 py-3">
      <div>
        <Label for="name">Name</Label>
        <Input
          v-model:model-value="localNodeData.data.name"
          id="name"
          type="text"
          name="name"
          placeholder="What do you call this node?"
        />
      </div>
      <div class="text-sm">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">Delay</h3>
          <button type="button" class="font-medium text-destructive" @click="handleRemoveDelay">
            Remove Delay
          </button>
        </div>
        <div class="flex items-center gap-x-4">
          <Input
            v-model:model-value="localNodeData.data.delay"
            id="delay"
            type="range"
            name="delay"
            min="0"
            max="10"
            default-value="0"
          />
          <span class="whitespace-nowrap">
            {{ localNodeData.data.delay ?? '0' }}
            seconds
          </span>
        </div>
      </div>
      <div>
        <Label for="file">File</Label>
        <div class="relative aspect-video rounded border-2 border-dashed p-1">
          <small
            class="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-balance text-center text-muted-foreground"
          >
            Drag and drop file here
          </small>
        </div>
      </div>
      <div>
        <Label for="file-url">or Paste File URL</Label>
        <Input
          v-model:model-value="localNodeData.data.file"
          type="url"
          name="file-url"
          id="file-url"
          placeholder="File URL"
        />
      </div>
      <Button type="button" variant="destructive" @click="handleClearFileURL">Clear File</Button>
    </main>
  </template>
</template>
