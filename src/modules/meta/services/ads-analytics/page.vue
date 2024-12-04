<script setup lang="ts">
import AnalyzeDataSection from './components/analyze-data-section.vue'
import DataTableSection from './components/data-table-section.vue'
import TableFiltersSection from './components/table-filters-section.vue'
import type { ColumnsSelected, RowsSelected } from './temporaries'
import Main from '@/core/components/ui/main.vue'
import { provide, ref } from 'vue'

const rowsSelected = ref<RowsSelected<unknown>>(null)
provide('rowsSelected', rowsSelected)

const columnsSelected = ref<ColumnsSelected>(new Map())
provide('columnsSelected', columnsSelected)
</script>

<template>
  <Main class="grid gap-y-4">
    <template #heading>Ads Analytics</template>
    <TableFiltersSection />
    <AnalyzeDataSection />
    <DataTableSection />
  </Main>
</template>
