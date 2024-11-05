<script setup lang="ts">
import MessagesReceivedPerDayChart from './components/messages-received-per-day-chart.vue'
import TopAgentsTable from './components/top-agents-table.vue'
import TotalCampaignCountChart from './components/total-campaign-count-chart.vue'
import UniqueSubscribersPerUsersChart from './components/unique-subscribers-per-users-chart.vue'
import Main from '@/core/components/ui/main.vue'
</script>

<template>
  <Main class="grid gap-y-6">
    <template #heading>Dashboard</template>
    <MessagesReceivedPerDayChart />
    <UniqueSubscribersPerUsersChart />
    <TotalCampaignCountChart />
    <TopAgentsTable />
  </Main>
</template>
