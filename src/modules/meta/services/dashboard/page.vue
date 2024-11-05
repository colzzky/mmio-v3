<script setup lang="ts">
import MessagesPerDayChart from './components/messages-per-day-chart.vue'
import Main from '@/core/components/ui/main.vue'
</script>

<template>
  <Main class="grid gap-y-6">
    <template #heading>Dashboard</template>
    <MessagesPerDayChart />
  </Main>
</template>
