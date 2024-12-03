<script setup lang="ts">
import {
  metricLabels,
  formatAnalyticValues,
  metrics,
  type Analytics,
  type ColumnsSelected,
  type RowsSelected,
} from '../temporaries'
import { Button } from '@/core/components/ui/button'
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
} from '@/core/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/core/components/ui/tabs'
import { inject, type Ref } from 'vue'

const rowsSelected = inject('rowsSelected') as Ref<RowsSelected<Analytics>>
const columnsSelected = inject('columnsSelected') as Ref<ColumnsSelected>

function handleSelectColumn(event: CustomEvent) {
  if (typeof event.detail.value === 'string') {
    const metric = event.detail.value
    columnsSelected.value.has(metric)
      ? columnsSelected.value.delete(metric)
      : columnsSelected.value.set(metric, true)
  }
}

function handleDeselectColumn(key: (typeof metrics)[number]) {
  columnsSelected.value.delete(key)
}
</script>

<template>
  <Tabs default-value="grid">
    <div class="flex items-center justify-between gap-x-2 rounded border bg-primary/5 p-2">
      <div class="flex flex-wrap items-center justify-start gap-1">
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="gap-x-2 text-blue-600" size="sm">
              <i class="bx bx-plus" />
              Add Metric
            </Button>
          </PopoverTrigger>
          <PopoverContent class="p-0">
            <Command>
              <CommandInput placeholder="Select a metric..." />
              <CommandEmpty>No metric found</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="metric in metrics"
                    :key="metric"
                    :value="metric"
                    class="gap-x-2"
                    @select="handleSelectColumn"
                  >
                    <i v-if="columnsSelected.has(metric)" class="bx bx-check" />
                    {{ metricLabels[metric] }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          v-for="[key] in columnsSelected"
          :key
          variant="outline"
          size="sm"
          class="gap-x-2"
          @click="handleDeselectColumn(key)"
        >
          {{ metricLabels[key] }}
          <i class="bx bx-x" />
        </Button>
      </div>
      <TabsList class="border bg-transparent p-0">
        <TabsTrigger value="bar" class="px-1.5 py-0.5" disabled>
          <span class="sr-only">Bar chart view option</span>
          <i class="bx bx-bar-chart text-lg" />
        </TabsTrigger>
        <TabsTrigger value="line" class="px-1.5 py-0.5" disabled>
          <span class="sr-only">Line chart view option</span>
          <i class="bx bx-line-chart text-lg" />
        </TabsTrigger>
        <TabsTrigger value="grid" class="px-1.5 py-0.5">
          <span class="sr-only">Grid view option</span>
          <i class="bx bx-grid text-lg" />
        </TabsTrigger>
      </TabsList>
    </div>
    <TabsContent value="bar">Bar</TabsContent>
    <TabsContent value="line">Line</TabsContent>
    <TabsContent value="grid">
      <div
        v-if="rowsSelected?.rows.length"
        class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4"
      >
        <article
          v-for="row in rowsSelected.rows"
          :key="row.id"
          class="grid overflow-hidden rounded-lg border bg-card text-sm text-card-foreground shadow-sm"
        >
          <img :src="row.original.post.image" alt="" class="h-auto w-full" />
          <div class="p-4">
            <h2 class="font-bold">{{ row.original.post.name }}</h2>
            <dl class="grid grid-cols-2 items-center gap-y-2 text-xs">
              <template v-for="([key, value], index) in columnsSelected" :key="index">
                <template v-if="value">
                  <dd class="text-muted-foreground">{{ metricLabels[key] }}</dd>
                  <dt class="justify-self-end rounded bg-muted px-2 py-1 font-medium">
                    {{ formatAnalyticValues({ key, value: row.original[key] }) }}
                  </dt>
                </template>
              </template>
            </dl>
          </div>
        </article>
      </div>
      <div
        v-else-if="!rowsSelected?.rows.length"
        class="grid min-h-[25svh] place-content-center *:text-center"
      >
        <strong>No rows selected</strong>
        <p class="text-xs text-muted-foreground">Select rows to analyze performance</p>
      </div>
    </TabsContent>
  </Tabs>
</template>
