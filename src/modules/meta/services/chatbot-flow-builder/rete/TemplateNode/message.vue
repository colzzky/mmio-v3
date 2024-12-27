<script setup lang="ts">
import Button from '@/core/components/ui/button/Button.vue'
import NodeCard from '../node-card.vue'
import NodeSocket from '../node-socket.vue'
import { sortByIndex } from '../utils'
import type { MetaTemplateOutput, Node, Schemes } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import { computed, onMounted, onUpdated, ref, watch } from 'vue'
import { objectEntries } from '@vueuse/core'
import Label from '@/core/components/ui/label/Label.vue'

const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()
const node = ref<Node<'message_node'> | null>(null)

onMounted(() => {
  node.value = props.data as Node<'message_node'>
})

const inputs = computed(() => {
  const entries = Object.entries(node.value?.inputs || {})
  return sortByIndex(entries)
})

// const quickReplies = ref(sortByIndex(
//   Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('quickReply')) as [
//     string,
//     MetaTemplateOutput,
//   ][],
// ),
// )

// const replies = ref(sortByIndex(
//   Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('reply')) as [
//     string,
//     MetaTemplateOutput,
//   ][],
// ))

// onUpdated(() => {
//   quickReplies.value = sortByIndex(
//     Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('quickReply')) as [
//       string,
//       MetaTemplateOutput,
//     ][],
//   )

//   replies.value = sortByIndex(
//     Object.entries(node.value?.inputs || {}).filter(([key]) => key.split('_').includes('reply')) as [
//       string,
//       MetaTemplateOutput,
//     ][],
//   )
// })
</script>

<template>
  <div class="space-y-2">
    <div class="w-full p-2 border rounded-lg border-neutral-200 bg-neutral-100 flex">
      <span class="text-xs font-semibold text-gray-600">{{ node?.data?.name }}</span>
    </div>
    <NodeCard :data-selected="data.selected" class="flex flex-col gap-y-3 pb-0">
      <!-- inputs -->
      <section>
        <template v-for="[key, input] in inputs" :key="key + seed" class="flex flex-col gap-4">
          <div v-if="input" :data-testid="`input-${key}`" class="relative">
            <div class="px-2 flex justify-center items-center rounded-lg">
              <div class="w-full h-9 rounded-md px-3 flex items-center">
                <span class="flex items-center gap-x-2 font-semibold">
                  <Icon icon="bx:message" class="size-6" />
                  Message
                </span>
              </div>
            </div>
            <!-- Circle overlapping the border of the main div -->
            <div class="absolute bottom-2 -left-3 rounded-full">
              <NodeSocket :emit :data="{
                type: 'socket',
                side: 'input',
                key,
                nodeId: data.id,
                payload: input.socket,
              }" data-testid="input-socket" />

            </div>
            <!-- <NodeSocket v-show="input.control && input.showControl" :emit :data="{ type: 'control', payload: input.control }" data-testid="input-control" /> -->
          </div>
        </template>
      </section>

      <!-- <div class="relative">
      <div class="px-5 flex justify-center items-center rounded-lg">
        <div class="w-full h-9 rounded-md px-3 border flex items-center justify-center">test</div>
      </div>
      <div class="absolute top-1.5 -right-3 w-6 h-6 bg-blue-500 rounded-full border-2 border-gray-500"></div>
    </div> -->

      <!-- replies -->
      <section class="space-y-2">
        <div class="px-5 space-y-2">
          <Label>Message:</Label>
          <div class="max-h-48 bg-white rounded-lg border border-gray-200 p-3">
            <div v-if="node?.data?.text" class="overflow-hidden line-clamp-6">
              {{ node?.data?.text }}
            </div>
            <div v-else>
              <p class="text-gray-400">No Message Available</p>
            </div>
          </div>
          <p class></p>
        </div>
        <div v-if="node && node.data">
          <div v-if="objectEntries(node.data.buttons).length > 0" class="flex flex-col gap-2">
            <template v-for="(button, key) in node.data.buttons" :key="key + seed">
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
        <div class="flex flex-col gap-4">
          <div v-if="node && node.data">
            <template v-if="node.outputs['num1']" :data-testid="`num1`">
              <div class="relative">
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
                    key: 'num1',
                    nodeId: data.id,
                    payload: node.outputs['num1'].socket,
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
