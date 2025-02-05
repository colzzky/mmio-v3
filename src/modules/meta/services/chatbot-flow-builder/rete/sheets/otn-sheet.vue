<script setup lang="ts">
import { nodeIconMapping } from '../utils'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import { SheetHeader, SheetTitle, SheetDescription } from '@/core/components/ui/sheet'
import { Textarea } from '@/core/components/ui/textarea'
import { toast } from '@/core/components/ui/toast'
import { Node } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { onMounted, ref, watch } from 'vue'

const authWorkspace = useAuthWorkspaceStore()
const { active_flow, rete_init } = authWorkspace

const localNodeData = ref<Node<'otn_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(active_flow.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'otn_node'>
})

watch(
  () => active_flow.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'otn_node'>
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
</script>

<template>
  <template v-if="localNodeData && localNodeData.data">
    <SheetHeader
      class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
    >
      <Icon
        :icon="nodeIconMapping[localNodeData.label]"
        class="row-span-full size-[var(--icon-size)] self-center"
      />
      <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
      <SheetDescription class="leading-none">OTN</SheetDescription>
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
        <Label> Use Existing OTN or Create New? </Label>
        <Select default-value="new">
          <SelectTrigger>
            <SelectValue placeholder="New OTN or Existing OTN" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="existing">Existing</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label for="otn-title">
          OTN Title <small>(Completes the phrase: 'Get Notified')</small>
        </Label>
        <Input id="otn-title" type="text" name="otn-title" placeholder="When..." />
      </div>
      <div>
        <Label for="otn-name"> OTN Name </Label>
        <Textarea
          id="otn-name"
          rows="5"
          placeholder="(So that you can identify your OTN when you re-use it later on.)"
        />
      </div>
      <div>
        <Label>Choose existing OTN</Label>
        <Select default-value="new">
          <SelectTrigger>
            <SelectValue placeholder="Existing OTN" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="otn-1">OTN #1</SelectItem>
              <SelectItem value="otn-2">OTN #2</SelectItem>
              <SelectItem value="otn-3">OTN #3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </main>
  </template>
</template>
