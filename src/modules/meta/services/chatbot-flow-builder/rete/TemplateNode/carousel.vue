<script setup lang="ts">
import NodeCard from '../node-card.vue'
import NodeSocket from '../node-socket.vue'
import { sortByIndex } from '../utils'
import type { MeteTemplateOutput, Schemes } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import { computed, onUpdated, ref } from 'vue'

const props = defineProps<{ data: Node<'carousel_node'>; emit: any; seed: number }>()

const inputs = computed(() => sortByIndex(Object.entries(props.data.inputs)))

const quickReplies = ref(
  sortByIndex(
    Object.entries(props.data.outputs).filter(([key]) => key.split('_').includes('quickReply')) as [
      string,
      MetaTemplateOutput<'quickReply'>,
    ][],
  ),
)

function getCardsOutput(title: string) {
  const carouselCardOutputs = sortByIndex(
    Object.entries(props.data.outputs).filter(([key]) =>
      key.split('_').includes('carouselCard'),
    ) as [string, MetaTemplateOutput<'carouselCard'>][],
  )

  return carouselCardOutputs.filter(([, output]) => output?.data.cardTitle === title)
}

onUpdated(() => {
  quickReplies.value = sortByIndex(
    Object.entries(props.data.outputs).filter(([key]) => key.split('_').includes('quickReply')) as [
      string,
      MetaTemplateOutput<'quickReply'>,
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
          <span class="flex items-center gap-x-2 font-semibold">
            <Icon icon="bx:carousel" class="size-6" />
            Carousel
          </span>
          <NodeSocket
            v-show="input.control && input.showControl"
            :emit
            :data="{ type: 'control', payload: input.control }"
            data-testid="input-control"
          />
        </div>
      </template>
    </section>

    <!-- cards -->
    <section v-if="data.data" class="-mx-[calc(var(--socket-size)/2)] flex flex-col gap-y-2">
      <h2 class="ms-[calc(var(--socket-size)+theme(spacing.4))] self-start text-base font-bold">
        Cards:
      </h2>
      <article v-for="(card, index) in data.data.cards" :key="index + seed" class="grid gap-y-2">
        <h3 class="ms-[calc(var(--socket-size)+theme(spacing.4))] font-medium">
          {{ card.title }}
        </h3>
        <div class="grid gap-y-2">
          <template v-for="[key, output] in getCardsOutput(card.title)" :key="key + seed">
            <div
              v-if="output"
              :data-testid="`output-${key}`"
              class="flex items-center gap-x-3 self-end justify-self-end text-xs"
            >
              <span class="flex flex-col text-end">
                <p>{{ output.data.label }}</p>
                <strong>{{ output.data.type }}</strong>
              </span>
              <NodeSocket
                :emit
                :data="{
                  type: 'socket',
                  side: 'output',
                  key,
                  nodeId: data.id,
                  payload: output.socket,
                }"
              />
            </div>
          </template>
        </div>
      </article>
    </section>

    <!-- quick replies -->
    <section class="-mx-[calc(var(--socket-size)/2)] flex flex-col items-end gap-y-3">
      <h2 class="ms-[calc(var(--socket-size)+theme(spacing.4))] self-start text-base font-bold">
        Quick Replies:
      </h2>
      <template v-for="[key, quickReply] in quickReplies" :key="key + seed">
        <div
          v-if="quickReply"
          :data-testid="`output-${key}`"
          class="flex items-center gap-x-3 text-xs"
        >
          <span>{{ quickReply.data.title }}</span>
          <NodeSocket
            :emit
            :data="{
              type: 'socket',
              side: 'output',
              key,
              nodeId: data.id,
              payload: quickReply.socket,
            }"
          />
        </div>
      </template>
    </section>
  </NodeCard>
</template>
