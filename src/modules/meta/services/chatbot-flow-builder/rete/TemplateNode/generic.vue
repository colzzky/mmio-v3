<script setup lang="ts">
import NodeCard from '../node-card.vue'
import NodeSocket from '../node-socket.vue'
import { nodeIconMapping, sortByIndex } from '../utils'
import Label from '@/core/components/ui/label/Label.vue'
import type { Node, Schemes } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import { objectEntries } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()
const node = ref<Node<'generic_node'> | null>(null)

onMounted(() => {
  node.value = props.data as Node<'generic_node'>
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
                  Generic
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

      <!-- replies -->
      <section class="space-y-2">
        <div class="space-y-2 px-5">
          <div
            class="flex min-h-28 items-center justify-center rounded-lg border-4 border-dotted border-gray-400 p-2"
          >
            <img
              v-if="node?.data?.image"
              :src="node?.data?.image"
              alt="Placeholder Image"
              class="max-h-full max-w-full rounded-lg object-contain"
            />
            <span v-else>No available Image</span>
          </div>
          <div>
            <Label>Heding:</Label>
            <div class="max-h-28 rounded-lg border border-gray-200 bg-white p-3">
              <div v-if="node?.data?.title" class="line-clamp-2 overflow-hidden">
                {{ node?.data?.title }}
              </div>
              <div v-else>
                <p class="text-gray-400">No Message Available</p>
              </div>
            </div>
          </div>
          <div>
            <Label>Description:</Label>
            <div class="max-h-48 rounded-lg border border-gray-200 bg-white p-3">
              <div v-if="node?.data?.text" class="line-clamp-6 overflow-hidden">
                {{ node?.data?.text }}
              </div>
              <div v-else>
                <p class="text-gray-400">No Message Available</p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="node && node.data">
          <div v-if="objectEntries(node.data.buttons).length > 0" class="flex flex-col gap-2">
            <template v-for="(button, key) in node.data.buttons" :key="key + seed">
              <div v-if="button" :data-testid="key">
                <div class="relative">
                  <div class="flex items-center rounded-lg px-5">
                    <span
                      class="border-1 flex w-full items-center justify-center gap-x-2 rounded-md bg-white p-1 px-2 text-xs font-medium text-gray-400"
                    >
                      <p>{{ button.title }}</p>
                    </span>
                  </div>
                  <!-- Circle overlapping the border of the main div -->
                  <div class="absolute -right-2.5 -top-0 rounded-full">
                    <NodeSocket
                      :emit
                      :data="{
                        type: 'socket',
                        side: 'output',
                        key,
                        nodeId: data.id,
                        payload: node.outputs[key]?.socket,
                      }"
                      class="[--socket-size:16px]"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else>
            <div>
              <div class="relative">
                <div class="flex items-center justify-end rounded-lg px-5">
                  <span
                    class="border-1 flex w-full items-center justify-center gap-x-2 rounded-md border-2 border-dotted bg-white p-1 px-2 text-xs font-medium text-gray-400"
                  >
                    <p>No Buttons Avaialable</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- quick replies -->
      <section class="space-y-3">
        <div class="px-5 font-bold">Quick Replies:</div>
        <div v-if="node && node.data">
          <div v-if="objectEntries(node.data.quick_replies).length > 0" class="flex flex-col gap-4">
            <template v-for="(quickReply, key) in node.data.quick_replies" :key="key + seed">
              <div v-if="quickReply" :data-testid="key">
                <div class="relative">
                  <div class="flex items-center justify-end rounded-lg px-5">
                    <span
                      class="border-1 flex items-center gap-x-2 rounded-full bg-white p-1 px-2 text-xs font-medium text-gray-400"
                    >
                      <p>{{ quickReply.title }}</p>
                    </span>
                  </div>
                  <!-- Circle overlapping the border of the main div -->
                  <div class="absolute -right-2.5 -top-0 rounded-full">
                    <NodeSocket
                      :emit
                      :data="{
                        type: 'socket',
                        side: 'output',
                        key,
                        nodeId: data.id,
                        payload: node.outputs[key]?.socket,
                      }"
                      class="[--socket-size:16px]"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else>
            <div>
              <div class="relative">
                <div class="flex items-center justify-end rounded-lg px-5">
                  <span
                    class="flex items-center gap-x-2 rounded-full border-2 border-dotted bg-white p-1 px-2 text-xs font-medium text-gray-400"
                  >
                    <p>No Qucik Replies yet</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-t py-2">
        <div v-if="node && node.data">
          <div class="flex flex-col gap-4">
            <template v-for="[key, output] in outputs" :key="key + seed">
              <div v-if="output && key === 'num1'" :data-testid="`input-${key}`" class="relative">
                <div class="flex items-center justify-end rounded-lg px-5">
                  <span class="flex items-center gap-x-2 font-semibold text-gray-400">
                    Continue to Next Step
                  </span>
                </div>
                <!-- Circle overlapping the border of the main div -->
                <div class="absolute -right-2.5 -top-0.5 rounded-full">
                  <NodeSocket
                    :emit
                    :data="{
                      type: 'socket',
                      side: 'output',
                      key,
                      nodeId: data.id,
                      payload: output.socket,
                    }"
                    class="[--socket-size:16px]"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </NodeCard>
  </div>
</template>
