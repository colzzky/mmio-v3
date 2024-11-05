<script setup lang="ts">
import { dateTimeFormat, subtractDays } from '../utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card'
import { BarChart } from '@/core/components/ui/chart-bar'

// @temporary: for visual purposes only
const today = new Date()

const data = [
  {
    date: subtractDays(today, 6),
    'Liam Parker': 10,
    'Sofia Ramirez': 5,
    'Ethan Wu': 8,
    'Maya Johnson': 12,
    'Noah Patel': 7,
  },
  {
    date: subtractDays(today, 5),
    'Liam Parker': 15,
    'Sofia Ramirez': 8,
    'Ethan Wu': 12,
    'Maya Johnson': 16,
    'Noah Patel': 10,
  },
  {
    date: subtractDays(today, 4),
    'Liam Parker': 18,
    'Sofia Ramirez': 12,
    'Ethan Wu': 15,
    'Maya Johnson': 19,
    'Noah Patel': 14,
  },
  {
    date: subtractDays(today, 3),
    'Liam Parker': 22,
    'Sofia Ramirez': 18,
    'Ethan Wu': 20,
    'Maya Johnson': 23,
    'Noah Patel': 18,
  },
  {
    date: subtractDays(today, 2),
    'Liam Parker': 28,
    'Sofia Ramirez': 23,
    'Ethan Wu': 25,
    'Maya Johnson': 28,
    'Noah Patel': 22,
  },
  {
    date: subtractDays(today, 1),
    'Liam Parker': 33,
    'Sofia Ramirez': 27,
    'Ethan Wu': 29,
    'Maya Johnson': 34,
    'Noah Patel': 25,
  },
  {
    date: dateTimeFormat.format(today),
    'Liam Parker': 40,
    'Sofia Ramirez': 33,
    'Ethan Wu': 35,
    'Maya Johnson': 42,
    'Noah Patel': 28,
  },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Unique Subscriber per Users</CardTitle>
      <CardDescription>
        Number of unique subscribers reached by each user over the past week.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <BarChart
        :data="data"
        index="date"
        :categories="['Liam Parker', 'Sofia Ramirez', 'Ethan Wu', 'Maya Johnson', 'Noah Patel']"
      />
    </CardContent>
  </Card>
</template>
