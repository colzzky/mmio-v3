<script setup lang="ts">
import type { Schemes } from '@/core/utils/flow-types';
import { Icon } from '@iconify/vue'
import { Ref } from 'rete-vue-plugin'
import { computed } from 'vue'

function sortByIndex(entries: [string, any][]) {
    return entries.sort((a, b) => {
        const ai = (a[1]?.index) || 0
        const bi = (b[1]?.index) || 0
        return ai - bi
    })
}


// emit:any cos idk emit type, can't find in rete.js
const props = defineProps<{ data: Schemes['Node']; emit: any; seed: number }>()

const outputs = computed(() => sortByIndex(Object.entries(props.data.outputs)))
const inputs = computed(() => sortByIndex(Object.entries(props.data.inputs)))
const controls = computed(() => sortByIndex(Object.entries(props.data.controls)))
</script>

<template>
  <article
    class="relative flex aspect-video w-64 flex-col justify-between rounded-lg border bg-slate-50 text-sm [--socket-size:36px] hover:bg-slate-300 data-[selected=true]:bg-slate-600 data-[selected=true]:text-slate-50"
    :data-selected="data.selected"
    data-testid="node"
  > 
    <!-- inputs -->
    <section class="border-b py-2 text-xs font-medium">
      <template v-for="[key, input] in inputs" :key="key + seed">
        <div v-if="input" :data-testid="`input-${key}`" class="flex items-center gap-x-4">
          <Ref
            :emit
            :data="{ type: 'socket', side: 'input', key, nodeId: data.id, payload: input.socket }"
            data-testid="input-socket"
            class="-mx-[calc(var(--socket-size)/2)] [&>div[title=socket]]:bg-slate-700"
          />
          <div v-show="!input.control || !input.showControl" data-testid="input-title">
            {{ input.label }}
          </div>
          <Ref
            class="input-control"
            v-show="input.control && input.showControl"
            :emit
            :data="{ type: 'control', payload: input.control }"
            data-testid="input-control"
          />
        </div>
      </template>
    </section>

    <!-- Controls-->
    <section class="p-4">
      <Ref
        v-for="[key, control] in controls"
        :key="key + seed"
        :emit
        :data="{ type: 'control', payload: control }"
        :data-testid="'control-' + key"
        class="relative"
      />
    </section>

    <!-- outputs -->
    <section class="border-t py-2 text-xs font-medium">
      <template v-for="[key, output] in outputs" :key="key + seed">
        <div
          v-if="output"
          :data-testid="`output-${key}`"
          class="flex items-center justify-end gap-x-4"
        >
          <div v-if="output.label">
            {{ output.label }}
          </div>
          <Ref
            :emit
            :data="{ type: 'socket', side: 'output', key, nodeId: data.id, payload: output.socket }"
            data-testid="output-socket"
            class="-mx-[calc(var(--socket-size)/2)] [&>div[title=socket]]:bg-slate-700"
          />
        </div>
      </template>
    </section>

    <!-- node label -->
    <div
      class="absolute inset-x-0 top-[calc(100%+1rem)] flex items-center justify-center gap-x-2 font-semibold capitalize [[data-selected=true]_&]:text-slate-950"
    >
      <Icon icon="formkit:text" />
      Text
    </div>
  </article>
</template>
