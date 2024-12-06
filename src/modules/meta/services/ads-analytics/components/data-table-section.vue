<script setup lang="ts" generic="TData">
import { columns } from '../columns'
import { analytics, type Analytics } from '../temporaries'
import DataTable from '@/modules/meta/services/ads-analytics/components/data-table.vue'
import { ref } from 'vue'

const data = ref<Analytics[]>(analytics)
</script>

<template>
  <section class="grid gap-y-2">
    <DataTable :columns :data />
  </section>
</template>
