<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'

const data = [
  {
    agentPicture: 'https://randomuser.me/api/portraits/women/1.jpg',
    agentName: 'Alice Johnson',
    chatsAssigned: 120,
    chatsMessaged: 100,
    salesClosed: 15,
    conversionRate: '15%',
  },
  {
    agentPicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    agentName: 'Bob Smith',
    chatsAssigned: 150,
    chatsMessaged: 130,
    salesClosed: 20,
    conversionRate: '15.4%',
  },
  {
    agentPicture: 'https://randomuser.me/api/portraits/men/2.jpg',
    agentName: 'Charlie Brown',
    chatsAssigned: 90,
    chatsMessaged: 70,
    salesClosed: 10,
    conversionRate: '14.3%',
  },
  {
    agentPicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    agentName: 'Dana White',
    chatsAssigned: 200,
    chatsMessaged: 180,
    salesClosed: 30,
    conversionRate: '16.7%',
  },
  {
    agentPicture: 'https://randomuser.me/api/portraits/women/3.jpg',
    agentName: 'Eve Davis',
    chatsAssigned: 110,
    chatsMessaged: 90,
    salesClosed: 12,
    conversionRate: '13.3%',
  },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Top Agents</CardTitle>
      <CardDescription>
        Ranking of agents based on total chats assigned, messages sent, and sales closed over the
        past week.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Chats Assigned</TableHead>
            <TableHead>Chats Messaged</TableHead>
            <TableHead>Sales Closed</TableHead>
            <TableHead class="text-end">Conversion Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(row, index) in data" :key="index">
            <TableCell>
              <div class="flex items-center gap-x-2">
                <Avatar>
                  <AvatarImage :src="row.agentPicture" />
                  <AvatarFallback>{{ row.agentName }}</AvatarFallback>
                </Avatar>
                {{ row.agentName }}
              </div>
            </TableCell>
            <TableCell>{{ row.chatsAssigned }}</TableCell>
            <TableCell>{{ row.chatsMessaged }}</TableCell>
            <TableCell>{{ row.salesClosed }}</TableCell>
            <TableCell class="text-end">{{ row.conversionRate }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
