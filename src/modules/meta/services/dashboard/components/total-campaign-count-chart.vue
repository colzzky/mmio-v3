<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card'
import { DonutChart } from '@/core/components/ui/chart-donut'

// @temporary: for visual purposes only
const data = [
  { name: 'Chatbot Flow Builder', count: 30 },
  { name: 'Comment Auto Replies', count: 50 },
  { name: 'Growth Tools', count: 25 },
  { name: 'Chat Sequences', count: 40 },
  { name: 'Post Randomizer', count: 15 },
  { name: 'Other Campaigns', count: 20 },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Total Campaign Count</CardTitle>
      <CardDescription>Total number of campaigns launched over the past week</CardDescription>
    </CardHeader>
    <CardContent>
      <DonutChart index="name" category="count" :data="data" type="pie" />
    </CardContent>
  </Card>
</template>
