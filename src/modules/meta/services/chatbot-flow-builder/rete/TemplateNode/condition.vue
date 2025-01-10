<script setup lang="ts">
import NodeCard from '../node-card.vue'
import NodeSocket from '../node-socket.vue'
import { nodeIconMapping, sortByIndex } from '../utils'
import Label from '@/core/components/ui/label/Label.vue'
import type { Node, Schemes } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()
const node = ref<Node<'condition_node'> | null>(null)

onMounted(() => {
  node.value = props.data as Node<'condition_node'>
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
    <div
      class="flex w-full items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-100 p-2"
    >
      <span class="text-xs font-semibold text-gray-600">{{
        node?.data?.name ? node?.data?.name : 'Untitled Generic Node'
      }}</span>
    </div>

    <NodeCard :data-selected="data.selected" class="flex flex-col gap-y-3 pb-0">
      <!-- inputs -->
      <section>
        <template v-for="[key, input] in inputs" :key="key + seed">
          <div v-if="input" :data-testid="`input-${key}`" class="relative">
            <div class="flex items-center justify-center rounded-lg px-2">
              <div class="flex h-9 w-full items-center rounded-md px-3">
                <span class="flex items-center gap-x-2 font-semibold">
                  <Icon :icon="nodeIconMapping[data.label]" class="size-6" />
                  Condition
                </span>
              </div>
            </div>
            <!-- Circle overlapping the border of the main div -->
            <div class="absolute -left-3 bottom-2 rounded-full">
              <NodeSocket
                :emit
                :data="{
                  type: 'socket',
                  side: 'input',
                  key,
                  nodeId: data.id,
                  payload: input.socket,
                }"
                data-testid="input-socket"
              />
            </div>
            <!-- <NodeSocket v-show="input.control && input.showControl" :emit :data="{ type: 'control', payload: input.control }" data-testid="input-control" /> -->
          </div>
        </template>
      </section>

      <section class="space-y-2">
        <div class="space-y-2 px-5">
          <div>
            <Label>Conditions:</Label>
            <div class="max-h-28 rounded-lg border border-gray-200 bg-white p-3">
              <div
                v-if="node?.data?.conditions && node?.data?.conditions.length > 0"
                class="line-clamp-2 flex gap-3 overflow-hidden"
              >
                <div
                  v-for="(condition, key) in node?.data?.conditions"
                  :key
                  class="rounded-full bg-blue-500 px-2 py-1 text-white"
                >
                  {{ condition.label }}
                </div>
              </div>
              <div v-else>
                <p class="text-gray-400">No Message Node</p>
              </div>
            </div>
          </div>
          <div>
            <Label>Condition Requirements:</Label>
            <div class="max-h-48 rounded-lg border border-gray-200 bg-white p-3">
              {{ node?.data?.type }}
            </div>
          </div>
        </div>
        <div v-if="node && node.data">
          <div class="flex flex-col gap-2">
            <template v-for="[key, output] in outputs" :key="key + seed">
              <div v-if="output && key === 'num1'" :data-testid="`num1`" class="relative">
                <div class="relative">
                  <div class="flex items-center rounded-lg px-5">
                    <span
                      class="border-1 flex w-full items-center justify-center gap-x-2 rounded-md bg-green-500 p-1 px-2 text-xs font-medium text-white"
                    >
                      <p>Condition is true</p>
                    </span>
                  </div>
                  <!-- Circle overlapping the border of the main div -->
                  <div class="absolute -right-2.5 -top-0 rounded-full">
                    <NodeSocket
                      :emit
                      :data="{
                        type: 'socket',
                        side: 'output',
                        key: 'num1',
                        nodeId: data.id,
                        payload: output.socket,
                      }"
                      class="[--socket-size:16px]"
                    />
                  </div>
                </div>
              </div>
              <div v-if="output && key === 'num2'" :data-testid="`num2`" class="relative">
                <div class="relative">
                  <div class="flex items-center rounded-lg px-5">
                    <span
                      class="border-1 flex w-full items-center justify-center gap-x-2 rounded-md bg-red-500 p-1 px-2 text-xs font-medium text-white"
                    >
                      <p>Condition is true</p>
                    </span>
                  </div>
                  <!-- Circle overlapping the border of the main div -->
                  <div class="absolute -right-2.5 -top-0 rounded-full">
                    <NodeSocket
                      :emit
                      :data="{
                        type: 'socket',
                        side: 'output',
                        key: 'num2',
                        nodeId: data.id,
                        payload: output.socket,
                      }"
                      class="[--socket-size:16px]"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </NodeCard>
  </div>
</template>
