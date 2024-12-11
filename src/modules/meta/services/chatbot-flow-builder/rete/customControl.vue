<template>
  <div class="mx-auto container flex flex-col">
    <label>{{ props.data.details.label }}</label>
    <input v-model="props.data.details.placeholder" type="text" 
    />
    <!-- @pointerdown.stop=""
    @dblclick.stop="" -->
    <span>{{ props.data.details }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { TestControl } from '@/core/utils/flow-types';

const props = defineProps<{
  data: TestControl
}>()

onMounted(() => {
  console.log(props.data)
})
</script>
