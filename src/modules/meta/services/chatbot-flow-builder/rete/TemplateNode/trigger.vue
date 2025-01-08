<script setup lang="ts">
import NodeCard from '../node-card.vue'
import NodeSocket from '../node-socket.vue'
import { sortByIndex } from '../utils'
import type { Node, Schemes } from '@/modules/meta/utils/flow-types'
import { computed, onMounted, ref } from 'vue'
import { objectEntries } from '@vueuse/core'
import { Icon } from '@iconify/vue'

const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()
const node = ref<Node<'trigger_node'> | null>(null)

onMounted(() => {
  node.value = props.data as Node<'trigger_node'>
})

const inputs = computed(() => {
  const entries = Object.entries(node.value?.inputs || {})
  return sortByIndex(entries)
})

const outputs = computed(() => {
  const entries = Object.entries(node.value?.outputs || {})
  return sortByIndex(entries)
})


</script>

<template>
  <div class="space-y-2">
    <div class="w-full p-2 border rounded-lg border-neutral-200 bg-neutral-100 flex justify-between items-center gap-4">
      <span class="text-xs font-semibold text-gray-600">{{ node?.data?.name ? node?.data?.name : 'Untitled Trigger Node'}}</span>
    </div>

    <NodeCard :data-selected="data.selected" class="flex flex-col gap-y-3 pb-0">
      <!-- inputs -->
      <section class="space-y-2">
        <div class="px-5 space-y-2">
          <div class="min-h-28 border-4 border-dotted rounded-lg p-2 border-gray-400 flex items-center justify-center">
            <Icon icon="bx:bolt-circle" class="size-20" />
          </div>

        </div>
      </section>

      <section class="space-y-2">
        <div class="space-y-2 px-5">
          <div>
            <Label>Trigger Type:</Label>
            <div class="max-h-28 rounded-lg border border-gray-200 bg-white p-3">
              <div v-if="node?.data" class="line-clamp-2 overflow-hidden">
                {{ node?.data.trigger_type }}
              </div>
            </div>
          </div>
          <div>
            <Label>Keyword Trigger(s):</Label>
            <div class="max-h-48 rounded-lg border border-gray-200 bg-white p-3">
              <div v-if="node?.data?.trigger_keyword" class="line-clamp-6 overflow-hidden">
                {{ node?.data?.trigger_keyword }}
              </div>
              <div v-else>
                <p class="text-gray-400">No Available keywords</p>
              </div>
            </div>
          </div>
          <div>
            <Label>Keyword type:</Label>
            <div class="max-h-48 rounded-lg border border-gray-200 bg-white p-3">
              <div v-if="node?.data?.keyword_strictness" class="line-clamp-6 overflow-hidden">
                {{ node?.data?.keyword_strictness }}
              </div>
              <div v-else>
                <p class="text-gray-400">Strictness not set</p>
              </div>
            </div>
          </div>
        </div>
        </section>

      

      <section class="border-t py-2">
        <div v-if="node && node.data">
          <div class="flex flex-col gap-4">
            <template v-for="[key, output] in outputs" :key="key + seed" class="flex flex-col gap-4">
              <div v-if="output && key === 'num1'" :data-testid="`input-${key}`" class="relative">
                <div class="px-5 flex rounded-lg justify-end items-center">
                  <span class="flex items-center gap-x-2 font-semibold text-gray-400">
                    Continue to Next Step
                  </span>

                </div>
                <!-- Circle overlapping the border of the main div -->
                <div
                  class="absolute -top-0.5 -right-2.5 rounded-full">
                  <NodeSocket :emit :data="{
                    type: 'socket',
                    side: 'output',
                    key,
                    nodeId: data.id,
                    payload: output.socket,
                  }" class="[--socket-size:16px]" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </NodeCard>
  </div>

</template>