<script setup lang="ts">
defineProps<{ path: any }>()
</script>

<template>
  <svg
    data-testid="connection"
    class="overflow-visible pointer-events-none !absolute -z-10 h-[9999px] w-[9999px]"
    
  >
    <path :d="path" class="pointer-events-auto fill-none stroke-primary stroke-[3px]"></path>
  </svg>
</template>
