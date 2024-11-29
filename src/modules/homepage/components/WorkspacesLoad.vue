<script setup lang="ts">
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
</script>

<template>
  <div class="grid auto-rows-fr grid-cols-4 gap-8">
    <div
      v-for="n in 7"
      :key="n"
      class="flex animate-pulse flex-col rounded-lg border border-gray-100 border-primary/25 p-4"
    >
      <div class="flex flex-col items-center space-y-3">
        <Skeleton class="h-[125px] w-[250px] rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  </div>
</template>
