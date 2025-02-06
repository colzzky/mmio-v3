<script setup lang="ts">
import { nodeIconMapping, type MessageReplyForm, type QuickReplyForm } from '../utils'
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/core/components/ui/dropdown-menu'
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
import { createMetaTemplateOutIn, Node, ReteSockets } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { onMounted, reactive, ref, watch } from 'vue'

const authWorkspace = useAuthWorkspaceStore()
const { active_flow, rete_init } = authWorkspace

const localNodeData = ref<Node<'timegap_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(active_flow.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'timegap_node'>
})

watch(
  () => active_flow.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'timegap_node'>
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
    <!-- default state -->
    <SheetHeader
      class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
    >
      <Icon
        :icon="nodeIconMapping[localNodeData.label]"
        class="row-span-full size-[var(--icon-size)] self-center"
      />
      <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
      <SheetDescription class="leading-none">Timegap</SheetDescription>
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
        <Label>Delay Unit</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Set Sending Mode</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="anytime">Anytime</SelectItem>
              <SelectItem value="time-range">Time Range</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label for="from">From</Label>
        <Input type="time" id="from" />
      </div>
      <div>
        <Label for="to">To</Label>
        <Input type="time" id="to" />
      </div>
      <div>
        <Label>Messenger Tag / OTN / Marketing MSG</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="" />
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
      <div>
        <Label>Select Recurring Campaign</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="campaign-1">Campaign #1</SelectItem>
              <SelectItem value="campaign-2">Campaign #2</SelectItem>
              <SelectItem value="campaign-3">Campaign #3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </main>
  </template>
</template>
