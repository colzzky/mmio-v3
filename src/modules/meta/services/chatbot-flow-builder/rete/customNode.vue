<template>
  <div
    class="user-select-none relative box-border cursor-pointer rounded-lg border-2 border-gray-500 bg-white text-black"
    :class="{ 'border-red-500': data.selected }"
    z
    data-testid="node"
  >
    <!-- Title -->
    <div class="p-2 font-sans text-lg" data-testid="title">
      {{ data.label }}
    </div>

    <!-- Outputs -->
    <div
      class="text-right"
      v-for="[key, output] in outputs"
      :key="key + seed"
      :data-testid="'output-' + key"
    >
      <div
        class="mx-2 inline-block align-middle text-sm leading-6 text-white"
        data-testid="output-title"
      >
        {{ output.label }}
      </div>
      <Ref
        class="-mr-px inline-block text-right"
        :emit="emit"
        :data="{
          type: 'socket',
          side: 'output',
          key: key,
          nodeId: data.id,
          payload: output.socket,
        }"
        data-testid="output-socket"
      />
    </div>

    <!-- Controls -->
    <Ref
      class="px-3 py-2"
      v-for="[key, control] in controls"
      :key="key + seed"
      :emit="emit"
      :data="{ type: 'control', payload: control }"
      :data-testid="'control-' + key"
    >
    </Ref>
    <!-- 
        <div class="py-2 px-3" :data-testid="'control-' + test.key">
            <label class="block text-sm text-gray-700 mb-1">{{ (test.control as any).value }}</label>
            <input type="text" class="border px-2 py-1 rounded w-full" :value="test.control.value"
                @input="onControlInput($event, test,key)" placeholder="Test Control" />
        </div>
        {{ test.control.value }} -->

    <Ref
      class="px-3 py-2"
      :emit="emit"
      :data="{ type: 'control', payload: test.control }"
      :data-testid="'control-' + test.key"
    >
    </Ref>

    <!-- <Input :emit="emit" :data="{ type: 'control', payload: test.control }" /> -->

    <!-- Inputs -->
    <div
      class="text-left"
      v-for="[key, input] in inputs"
      :key="key + seed"
      :data-testid="'input-' + key"
    >
      <Ref
        class="-ml-px inline-block text-left"
        :emit="emit"
        :data="{
          type: 'socket',
          side: 'input',
          key: key,
          nodeId: data.id,
          payload: input.socket,
        }"
        data-testid="input-socket"
      />
      <div
        class="mx-2 inline-block align-middle text-sm leading-6 text-white"
        v-show="!input.control || !input.showControl"
        data-testid="input-title"
      >
        {{ input.label }}
      </div>
      <Ref
        class="z-10 inline-block w-[calc(100%-1.5rem)] align-middle"
        v-show="input.control && input.showControl"
        :emit="emit"
        :data="{ type: 'control', payload: input.control }"
        data-testid="input-control"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Schemes } from '@/modules/meta/utils/flow-types'
import { Ref } from 'rete-vue-plugin'
import { computed } from 'vue'

/**
 * Props
 */

const props = defineProps<{
  data: Schemes['Node']
  emit: any
  seed: number
}>()

/**
 * Computed Functions
 */
function sortByIndex(entries: [string, any][]) {
  return entries.sort((a, b) => {
    const ai = a[1]?.index || 0
    const bi = b[1]?.index || 0
    return ai - bi
  })
}

// function onControlInput(event: Event, key: any) {
//     const value = (event.target as HTMLInputElement).value;
//     test.value.control.value = value
//     props.emit('controlchange',{ type: 'control', payload: test.value.control, key: key, nodeId: test.value.control.id, });
// }

const inputs = computed(() => sortByIndex(Object.entries(props.data.inputs)))
const controls = computed(() => sortByIndex(Object.entries(props.data.controls)))
const outputs = computed(() => sortByIndex(Object.entries(props.data.outputs)))

const test = computed(() => ({
  key: 'input',
  control: props.data.controls['input'],
}))
</script>

<style scoped></style>
