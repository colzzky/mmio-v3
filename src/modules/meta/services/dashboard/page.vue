<script setup lang="ts">
import MessagesReceivedPerDayChart from './components/messages-received-per-day-chart.vue'
import UniqueSubscribersPerUsers from './components/unique-subscribers-per-users.vue'
import Main from '@/core/components/ui/main.vue'
</script>

<template>
  <Main class="grid gap-y-6">
    <template #heading>Dashboard</template>
    <MessagesReceivedPerDayChart />
    <UniqueSubscribersPerUsers />
    <MessagesReceivedPerDayChart />
    <MessagesReceivedPerDayChart />
  </Main>
</template>
