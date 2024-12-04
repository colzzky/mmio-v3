<script setup lang="ts">
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/core/components/ui/select'
</script>

<template>
  <section class="flex items-center gap-x-2">
    <Select disabled>
      <SelectTrigger class="w-max">
        <SelectValue placeholder="Last 14 days Nov 7 - 20, 2024" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Item #1</SelectItem>
        <SelectItem value="two">Item #2</SelectItem>
        <SelectItem value="three">Item #3</SelectItem>
      </SelectContent>
    </Select>
    <Select disabled>
      <SelectTrigger class="w-max">
        <SelectValue placeholder="Group by Creative" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Item #1</SelectItem>
        <SelectItem value="two">Item #2</SelectItem>
        <SelectItem value="three">Item #3</SelectItem>
      </SelectContent>
    </Select>
    <Select disabled>
      <SelectTrigger class="w-max">
        <SelectValue placeholder="Add Filter" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Item #1</SelectItem>
        <SelectItem value="two">Item #2</SelectItem>
        <SelectItem value="three">Item #3</SelectItem>
      </SelectContent>
    </Select>
  </section>
</template>
