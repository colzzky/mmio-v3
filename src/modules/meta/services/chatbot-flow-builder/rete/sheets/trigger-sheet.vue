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
import { Node } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

const { active_flow } = storeToRefs(useAuthWorkspaceStore())
const { rete_init } = active_flow.value

const localNodeData = ref<Node<'trigger_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(rete_init.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'trigger_node'>
})

watch(
  () => rete_init.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'trigger_node'>
    }
  },
)
</script>

<template>
  <template v-if="localNodeData && localNodeData.data">
    <!-- default state -->
    <SheetHeader
      v-if="localNodeData && localNodeData.data"
      class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
    >
      <Icon
        :icon="nodeIconMapping[localNodeData.label]"
        class="row-span-full size-[var(--icon-size)] self-center"
      />
      <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
      <SheetDescription class="leading-none">Trigger</SheetDescription>
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
      <div>
        <Label for="type">Trigger Type</Label>
        <Select v-model:model-value="localNodeData.data.trigger_type" id="type" name="type">
          <SelectTrigger>
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="get_started">Get Started</SelectItem>
              <SelectItem value="keyword">Keyword</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div v-if="localNodeData.data.trigger_type === 'keyword'">
        <Label for="keywords">Trigger keyword(s)</Label>
        <Textarea
          v-model:model-value="localNodeData.data.trigger_keyword"
          id="keywords"
          name="keywords"
          rows="5"
          class="resize-none"
          placeholder=""
        />
      </div>
      <div>
        <Label for="strictness">Trigger Strictness</Label>
        <Select
          v-model:model-value="localNodeData.data.keyword_strictness"
          id="strictness"
          name="strictness"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="wide">Wide</SelectItem>
              <SelectItem value="match">Match</SelectItem>
              <SelectItem value="strict">Strict</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </main>
  </template>
</template>
