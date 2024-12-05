<script setup lang="ts" generic="TData">
import { columns } from '../columns'
import { analytics, type Analytics } from '../temporaries'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/core/components/ui/select'
import DataTable from '@/modules/meta/services/ads-analytics/components/data-table.vue'
import { ref } from 'vue'

const data = ref<Analytics[]>(analytics)
</script>

<template>
  <section class="grid gap-y-2">
    <div class="flex items-center gap-x-2">
      <Select disabled>
        <SelectTrigger class="w-max">
          <SelectValue placeholder="Custom" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">Item #1</SelectItem>
          <SelectItem value="two">Item #2</SelectItem>
          <SelectItem value="three">Item #3</SelectItem>
        </SelectContent>
      </Select>
      <Select disabled>
        <SelectTrigger class="w-max">
          <SelectValue placeholder="Table Settings" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">Item #1</SelectItem>
          <SelectItem value="two">Item #2</SelectItem>
          <SelectItem value="three">Item #3</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <DataTable :columns :data />
  </section>
</template>
