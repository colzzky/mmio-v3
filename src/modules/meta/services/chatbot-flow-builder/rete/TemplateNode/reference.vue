<script setup lang="ts">
import NodeCard from '../node-card.vue'
import { sortByIndex } from '../utils'
import type { Schemes } from '@/modules/meta/utils/flow-types'
import NodeSocket from '@/modules/meta/services/chatbot-flow-builder/rete/node-socket.vue'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()

const outputs = computed(() => sortByIndex(Object.entries(props.data.outputs)))
</script>

<template>
  <NodeCard :data-selected="data.selected">
    <main class="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 gap-y-2">
      <Icon icon="bx:bolt-circle" class="size-20" />
      <h1 class="text-center font-semibold">Reference</h1>
    </main>

    <!-- outputs -->
    <section class="-mx-[calc(var(--socket-size)/2)] grid justify-end">
      <template v-for="[key, output] in outputs" :key="key + seed">
        <div v-if="output" :data-testid="`output-${key}`" class="flex items-center gap-x-4">
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
    </section>
  </NodeCard>
</template>
