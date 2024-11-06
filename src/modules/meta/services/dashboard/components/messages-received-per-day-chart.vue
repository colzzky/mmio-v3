<script setup lang="ts">
import { dateTimeFormat, subtractDays } from '../utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card'
import { LineChart } from '@/core/components/ui/chart-line'

// @temporary: for visual purposes only
const today = new Date()

const data = [
  { date: subtractDays(today, 6), messages: 120 },
  { date: subtractDays(today, 5), messages: 150 },
  { date: subtractDays(today, 4), messages: 200 },
  { date: subtractDays(today, 3), messages: 180 },
  { date: subtractDays(today, 2), messages: 220 },
  { date: subtractDays(today, 1), messages: 250 },
  { date: dateTimeFormat.format(today), messages: 300 },
]
</script>

<template>
  <Card class="col-span-2">
    <CardHeader>
      <CardTitle>Messages Received per Day</CardTitle>
      <CardDescription>Daily message volume over the past week</CardDescription>
    </CardHeader>
    <CardContent>
      <LineChart :data="data" index="date" :categories="['messages']" />
    </CardContent>
  </Card>
</template>
