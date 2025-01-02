<script setup lang="ts">
import NodeCard from '../node-card.vue'
import NodeSocket from '../node-socket.vue'
import type { MetaTemplateOutput, Node, Schemes } from '@/modules/meta/utils/flow-types'
import { sortByIndex } from '../utils'
import { Icon } from '@iconify/vue'
import { computed, onUpdated, ref } from 'vue'
import { onMounted } from 'vue'
import { objectEntries } from '@vueuse/core'

const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()
const node = ref<Node<'carousel_node'> | null>(null)

onMounted(() => {
  node.value = props.data as Node<'carousel_node'>
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
  <div class="space-y-2 w-auto">
    <div class="w-full p-2 border rounded-lg border-neutral-200 bg-neutral-100 flex justify-between items-center gap-4">
      <span class="text-xs font-semibold text-gray-600">{{ node?.data?.name ? node?.data?.name : 'Untitled Carousel Node'}}</span>
    </div>
    <div class=" border-2 border-dashed rounded-lg border-gray-500 p-4 space-y-4"
      :class="{ 'ring ring-blue-500': data.selected, 'hover:ring hover:ring-blue-200': !data.selected }">
      <NodeCard class="flex flex-col gap-y-3 pb-0 !h-auto !w-auto hover:ring-0">
        <section>
          <template v-for="[key, input] in inputs" :key="key + seed" class="flex flex-col gap-4">
            <div v-if="input" :data-testid="`input-${key}`" class="relative">
              <div class="px-2 flex justify-center items-center rounded-lg">
                <div class="w-full h-9 rounded-md px-3 flex items-center">
                  <span class="flex items-center gap-x-2 font-semibold">
                    <Icon icon="bx:message" class="size-6" />
                    Carousel Node
                  </span>
                </div>
              </div>
              <div class="absolute bottom-2 -left-3 rounded-full">
                <NodeSocket :emit :data="{
                  type: 'socket',
                  side: 'input',
                  key,
                  nodeId: data.id,
                  payload: input.socket,
                }" data-testid="input-socket" />

              </div>
            </div>
          </template>
        </section>

        <!-- quick replies -->
        <section class="space-y-3">
          <div class="px-5 font-bold">
            Quick Replies:
          </div>
          <div v-if="node && node.data">
            <div v-if="objectEntries(node.data.quick_replies).length > 0" class="flex flex-col gap-4">
              <template v-for="(quickReply, key) in node.data.quick_replies" :key="key + seed">
                <div v-if="quickReply" :data-testid="key">
                  <div class="relative">
                    <div class="px-5 flex rounded-lg justify-end items-center">
                      <span
                        class="flex items-center gap-x-2 text-xs font-medium text-gray-400 p-1 px-2 bg-white border-1 rounded-full">
                        <p>{{ quickReply.title }}</p>
                      </span>

                    </div>
                    <!-- Circle overlapping the border of the main div -->
                    <div class="absolute -top-0 -right-2.5 rounded-full">
                      <NodeSocket :emit :data="{
                        type: 'socket',
                        side: 'output',
                        key,
                        nodeId: data.id,
                        payload: node.outputs[key]?.socket,
                      }" class="[--socket-size:16px]" />
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div v-else>
              <div>
                <div class="relative">
                  <div class="px-5 flex rounded-lg justify-end items-center">
                    <span
                      class="flex items-center gap-x-2 text-xs font-medium text-gray-400 border-2 rounded-full p-1 px-2 bg-white border-dotted">
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
              <template v-for="[key, output] in outputs" :key="key + seed" class="flex flex-col gap-4">
                <div v-if="output && key === 'num1'" :data-testid="`input-${key}`" class="relative">
                  <div class="px-5 flex rounded-lg justify-end items-center">
                    <span class="flex items-center gap-x-2 font-semibold text-gray-400">
                      Continue to Next Step
                    </span>

                  </div>
                  <!-- Circle overlapping the border of the main div -->
                  <div class="absolute -top-0.5 -right-2.5 rounded-full">
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
      <div v-if="node && node.data" class="grid grid-cols-2 gap-3 items-stretch">
        <div v-if="node.data.cards.length < 11" class="border-4 border-neutral-200 border-dashed py-4 rounded-xl flex justify-center items-center">
          <section>
            <div class="px-5 space-y-2">
              Add more Cards
            </div>
          </section>
        </div>
        <div v-for="(card, key) in node.data.cards" :key="key + seed"
          class="w-64 border border-neutral-200 bg-neutral-100 py-4 rounded-xl">
          <section class="space-y-2">
            <div class="px-5 space-y-2">
              <div
                class="min-h-28 border-4 border-dotted rounded-lg p-2 border-gray-400 flex items-center justify-center">
                <img v-if="card.image" :src="card.image" alt="Placeholder Image"
                  class="max-w-full max-h-full object-contain rounded-lg" />
                <span v-else>No available Image</span>
              </div>
              <div>
                <Label>Heding:</Label>
                <div class="max-h-28 bg-white rounded-lg border border-gray-200 p-3">
                  <div v-if="card.title" class="overflow-hidden line-clamp-2">
                    {{ card.title }}
                  </div>
                  <div v-else>
                    <p class="text-gray-400">No Message Available</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Description:</Label>
                <div class="max-h-48 bg-white rounded-lg border border-gray-200 p-3">
                  <div v-if="card.text" class="overflow-hidden line-clamp-6">
                    {{ card.text }}
                  </div>
                  <div v-else>
                    <p class="text-gray-400">No Message Available</p>
                  </div>
                </div>
              </div>

            </div>
            <div v-if="node && node.data">
              <div v-if="objectEntries(card.buttons).length > 0" class="flex flex-col gap-2">
                <template v-for="(button, key) in card.buttons" :key="key + seed">
                  <div v-if="button" :data-testid="key">
                    <div class="relative">
                      <div class="px-5 flex rounded-lg items-center">
                        <span
                          class="flex items-center gap-x-2 text-xs font-medium text-gray-400 p-1 px-2 bg-white border-1 rounded-md w-full justify-center">
                          <p>{{ button.title }}</p>
                        </span>

                      </div>
                      <!-- Circle overlapping the border of the main div -->
                      <div class="absolute -top-0 -right-2.5 rounded-full">
                        <NodeSocket :emit :data="{
                          type: 'socket',
                          side: 'output',
                          key,
                          nodeId: data.id,
                          payload: node.outputs[key]?.socket,
                        }" class="[--socket-size:16px]" />
                      </div>
                    </div>
                  </div>
                </template>
              </div>
              <div v-else>
                <div>
                  <div class="relative">
                    <div class="px-5 flex rounded-lg justify-end items-center">
                      <span
                        class="flex items-center gap-x-2 text-xs font-medium text-gray-400 p-1 px-2 bg-white border-1 rounded-md w-full justify-center border-2 border-dotted">
                        <p>No Buttons Avaialable</p>
                      </span>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  </div>

</template>
