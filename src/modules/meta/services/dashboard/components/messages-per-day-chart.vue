<script setup lang="ts">
import { dateTimeFormat, subtractDays } from '../utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card'
import LineChart from '@/core/components/ui/chart-line/LineChart.vue'

// @temporary: for visual purposes only
const today = new Date()

const data = [
  { date: dateTimeFormat.format(subtractDays(today, 6)), messages: 120 },
  { date: dateTimeFormat.format(subtractDays(today, 5)), messages: 150 },
  { date: dateTimeFormat.format(subtractDays(today, 4)), messages: 200 },
  { date: dateTimeFormat.format(subtractDays(today, 3)), messages: 180 },
  { date: dateTimeFormat.format(subtractDays(today, 2)), messages: 220 },
  { date: dateTimeFormat.format(subtractDays(today, 1)), messages: 250 },
  { date: dateTimeFormat.format(today), messages: 300 },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Messages Received per Day</CardTitle>
      <CardDescription>Daily message volume over the past week</CardDescription>
    </CardHeader>
    <CardContent>
      <LineChart :data="data" index="date" :categories="['messages']" />
    </CardContent>
  </Card>
</template>
