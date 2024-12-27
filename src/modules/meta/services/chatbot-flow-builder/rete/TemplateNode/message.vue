<script setup lang="ts">
import NodeCard from '../node-card.vue'
import NodeSocket from '../node-socket.vue'
import { sortByIndex } from '../utils'
import MessageSheet from './message-sheet.vue'
import type { MetaTemplateOutput, Node, Schemes } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import { computed, onMounted, onUpdated, ref, watch } from 'vue'

const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()
const node = ref<Node<'message_node'> | null>(null)

onMounted(() => {
  node.value = props.data as Node<'message_node'>
})

const inputs = computed(() => {
  const entries = Object.entries(node.value?.inputs || {});
  return sortByIndex(entries);
});

const quickReplies = ref(sortByIndex(
  Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('quickReply')) as [
    string,
    MetaTemplateOutput,
  ][],
),
)

const replies = ref(sortByIndex(
  Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('reply')) as [
    string,
    MetaTemplateOutput,
  ][],
))

onUpdated(() => {
  quickReplies.value = sortByIndex(
    Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('quickReply')) as [
      string,
      MetaTemplateOutput,
    ][],
  )

  replies.value = sortByIndex(
    Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('reply')) as [
      string,
      MetaTemplateOutput,
    ][],
  )
})
</script>

<template>
  <NodeCard :data-selected="data.selected" class="flex flex-col gap-y-8">
    <!-- inputs -->
    <section class="-mx-[calc(var(--socket-size)/2)] grid justify-start">
      <template v-for="[key, input] in inputs" :key="key + seed">
        <div v-if="input" :data-testid="`input-${key}`" class="flex items-center gap-x-4">
          <NodeSocket :emit :data="{
            type: 'socket',
            side: 'input',
            key,
            nodeId: data.id,
            payload: input.socket,
          }" data-testid="input-socket" />
          <span class="flex items-center gap-x-2 font-semibold">
            <Icon icon="bx:message" class="size-6" />
            Message
          </span>
          <NodeSocket v-show="input.control && input.showControl" :emit
            :data="{ type: 'control', payload: input.control }" data-testid="input-control" />
        </div>
      </template>
    </section>

    <!-- replies -->
    <section class="-mx-[calc(var(--socket-size)/2)] flex flex-col items-end gap-y-3">
      <h2 class="ms-[calc(var(--socket-size)+theme(spacing.4))] self-start font-semibold">
        Replies:
      </h2>
      <div v-if="node && node.data">
        <template v-for="(reply, key) in node.data.buttons" :key="key + seed">
          <div v-if="reply" :data-testid="key" class="flex items-center gap-x-3 text-xs">
            <span class="flex flex-col text-end">
              <p>{{ reply.title }}</p>
              <strong>{{ reply.type }}</strong>
            </span>
            <NodeSocket :emit :data="{
              type: 'socket',
              side: 'output',
              key,
              nodeId: data.id,
              payload: node.outputs[key]?.socket,
            }" />
          </div>
        </template>
      </div>
      
    </section>

    <!-- quick replies -->
    <section class="-mx-[calc(var(--socket-size)/2)] flex flex-col items-end gap-y-3">
      <h2 class="ms-[calc(var(--socket-size)+theme(spacing.4))] self-start font-semibold">
        Quick Replies:
      </h2>
      <div v-if="node && node.data">
        <template v-for="(quickReply, key) in node.data.quick_replies" :key="key + seed">
          <div v-if="quickReply" :data-testid="key" class="flex items-center gap-x-3 text-xs">
            <span class="flex flex-col text-end">
              <p>{{ quickReply.title }}</p>
            </span>
            <NodeSocket :emit :data="{
              type: 'socket',
              side: 'output',
              key,
              nodeId: data.id,
              payload: node.outputs[key]?.socket,
            }" />
          </div>
        </template>
      </div>
    </section>
  </NodeCard>
</template>
