<script setup lang="ts" generic="TData, TValue">
import {
  metricLabels,
  metrics,
  type Analytics,
  type ColumnsSelected,
  type RowsSelected,
} from '../temporaries'
import { Button } from '@/core/components/ui/button'
import { Checkbox } from '@/core/components/ui/checkbox'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/core/components/ui/dialog'
import { Label } from '@/core/components/ui/label'
import { Popover, PopoverTrigger, PopoverContent } from '@/core/components/ui/popover'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/core/components/ui/select'
import { Separator } from '@/core/components/ui/separator'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { uiHelpers } from '@/core/utils/ui-helper'
import type {
  ColumnDef,
  ColumnPinningState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table'
import { computed, inject, ref, watch, type Ref } from 'vue'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

const sorting = ref<SortingState>([])
const rowSelection = ref({})
const columnPinning = ref<ColumnPinningState>({
  left: [],
  right: [],
})
const columnVisibility = ref<VisibilityState>()

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: (updaterOrValue) => uiHelpers.valueUpdater(updaterOrValue, sorting),
  onRowSelectionChange: (updaterOrValue) => uiHelpers.valueUpdater(updaterOrValue, rowSelection),
  onColumnPinningChange: (updaterOrValue) => uiHelpers.valueUpdater(updaterOrValue, columnPinning),
  onColumnVisibilityChange: (updaterOrValue) =>
    uiHelpers.valueUpdater(updaterOrValue, columnVisibility),
  columnResizeMode: 'onChange',
  columnResizeDirection: 'ltr',
  state: {
    get sorting() {
      return sorting.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get columnPinning() {
      return columnPinning.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
  },
})

const rowsSelected = inject('rowsSelected') as Ref<RowsSelected<TData>>
watch(
  () => table.getSelectedRowModel(),
  (value) => {
    rowsSelected.value = value
  },
)

const columnsSelected = inject('columnsSelected') as Ref<ColumnsSelected>
function handleColumnsCheckboxChange({
  headerId,
  value,
}: {
  headerId: keyof Omit<Analytics, 'post'>
  value: boolean
}) {
  if (value) {
    columnsSelected.value.set(headerId, true)
    return
  }

  columnsSelected.value.delete(headerId)
}

const visibleTableColumns = computed(() =>
  table.getAllColumns().filter((column) => column.getIsVisible()),
)
</script>

<template>
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
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="outline" size="sm" class="text-xs">Table Settings</Button>
      </PopoverTrigger>
      <PopoverContent class="grid p-0 text-sm">
        <ScrollArea as="ul" class="h-80 px-4 py-2">
          <template v-for="column in visibleTableColumns" :key="column.id">
            <li v-if="column.id !== 'post'" class="flex items-center justify-between">
              {{ metricLabels[column.id as (typeof metrics)[number]] }}
              <button
                type="button"
                class="p-1 leading-none"
                @click="column.toggleVisibility(false)"
              >
                <i class="bx bx-x text-sm" />
              </button>
            </li>
          </template>
        </ScrollArea>
        <Separator />

        <div class="p-1">
          <Dialog>
            <DialogTrigger as-child>
              <Button variant="ghost" size="sm" class="flex w-full justify-start gap-x-2">
                <i class="bx bx-plus text-lg" />
                Add Metrics
              </Button>
            </DialogTrigger>
            <DialogContent class="text-sm">
              <DialogHeader>
                <DialogTitle>Show / Hide KPIs</DialogTitle>
                <DialogDescription
                  >Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptas,
                  voluptatibus?</DialogDescription
                >
              </DialogHeader>
              <ScrollArea as="ul" class="h-80 [&>div>div]:grid [&>div>div]:gap-y-3">
                <template v-for="column in table.getAllColumns()" :key="column.id">
                  <li v-if="column.id !== 'post'" class="flex items-center gap-x-3">
                    <Checkbox
                      :id="column.id"
                      :checked="column.getIsVisible()"
                      @update:checked="(value) => column.toggleVisibility(value)"
                    />
                    <Label :for="column.id" class="font-normal">
                      {{ metricLabels[column.id as (typeof metrics)[number]] }}
                    </Label>
                  </li>
                </template>
              </ScrollArea>
              <Separator />
              <DialogFooter>
                <DialogClose as-child>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PopoverContent>
    </Popover>
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
  <div class="relative w-full overflow-auto rounded-md border">
    <table
      class="w-full caption-bottom text-xs"
      :style="{
        width: `${table.getCenterTotalSize()}px`,
        direction: table.options.columnResizeDirection,
      }"
    >
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="group/table-row data-[state=selected]:bg-muted"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :data-pinned="header.column.getIsPinned()"
            :data-resizing="header.column.getIsResizing()"
            class="group/table-head relative isolate gap-x-2 whitespace-normal border-e p-0 px-[var(--padding)] [--padding:theme(spacing.4)] first:border-e-0 group-hover/table-row:bg-[#F5F8FB] data-[pinned=left]:sticky data-[pinned=right]:sticky data-[pinned=left]:left-0 data-[pinned=right]:right-0 data-[pinned=left]:z-10 data-[pinned=right]:z-10 data-[pinned=left]:bg-background data-[pinned=right]:bg-background [&:has([role=checkbox])]:pr-[var(--padding)] first:[&:has([role=checkbox])]:p-0"
            :style="{
              width: `${header.getSize()}px`,
            }"
          >
            <div class="flex h-full items-center gap-x-2">
              <Checkbox
                v-if="header.index !== 0"
                :checked="columnsSelected.has(header.id as keyof Omit<Analytics, 'post'>)"
                @update:checked="
                  handleColumnsCheckboxChange({
                    headerId: header.id as keyof Omit<Analytics, 'post'>,
                    value: $event,
                  })
                "
              />
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <div
                :class="[
                  'absolute inset-y-0 right-0 hidden w-1 cursor-ew-resize touch-none select-none bg-primary/25 group-hover/table-head:block group-data-[resizing=true]/table-head:bg-primary/75',
                ]"
                @mousedown="header.getResizeHandler()?.($event)"
                @touchstart="header.getResizeHandler()?.($event)"
                @dblclick="header.column.resetSize()"
              />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
            class="group/table-row data-[state=selected]:bg-muted"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :data-pinned="cell.column.getIsPinned()"
              class="first:p-0 group-hover/table-row:bg-[#F5F8FB] data-[pinned=left]:sticky data-[pinned=right]:sticky data-[pinned=left]:left-0 data-[pinned=right]:right-0 data-[pinned=left]:bg-background data-[pinned=right]:bg-background group-data-[state=selected]/table-row:bg-muted"
              :style="{ width: `${cell.column.getSize()}px` }"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center"> No results. </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </table>
  </div>
</template>
