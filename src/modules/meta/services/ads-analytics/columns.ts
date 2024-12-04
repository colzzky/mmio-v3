import { metricLabels, formatAnalyticValues, type Analytics } from './temporaries'
import { Checkbox } from '@/core/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export const columns: ColumnDef<Analytics>[] = [
  {
    accessorKey: 'post',
    header: ({ table }) =>
      h('div', { class: 'flex items-center gap-x-3 border-e px-4 w-full h-full' }, [
        h(Checkbox, {
          checked:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate'),
          'onUpdate:checked': (value) => table.toggleAllPageRowsSelected(!!value),
          ariaLabel: 'Select all',
        }),
        `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected`,
      ]),
    cell({ getValue, row }) {
      const post = getValue() as Analytics['post']

      const adCount = `${post.advertisementCount} ${post.advertisementCount > 1 ? 'ads' : 'ad'}`

      return h(
        'div',
        {
          class:
            'grid grid-cols-[theme(spacing.4)_theme(spacing.12)_1fr] gap-x-3 whitespace-nowrap gap-y-1 p-4 border-e',
        },
        [
          h(Checkbox, {
            checked: row.getIsSelected(),
            'onUpdate:checked': (value) => row.toggleSelected(!!value),
            ariaLabel: 'Select row',
            class: 'row-span-2 self-center',
          }),
          h('img', { src: post.image, alt: '', class: 'row-span-2 rounded-md' }),
          h('strong', { class: 'text-sm/none self-end' }, post.name),
          h('p', { class: 'leading-none self-start' }, adCount),
        ],
      )
    },
    size: 300,
    minSize: 300,
  },
  {
    accessorKey: 'spend',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 115,
    minSize: 115,
  },
  {
    accessorKey: 'purchaseValue',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          class: '',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 165,
    minSize: 165,
  },
  {
    accessorKey: 'returnOnAdSpend',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    size: 110,
    minSize: 110,
  },
  {
    accessorKey: 'costPerPurchase',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 105,
    minSize: 105,
  },
  {
    accessorKey: 'costPerLinkClick',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 160,
    minSize: 160,
  },
  {
    accessorKey: 'costPerMille',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 105,
    minSize: 105,
  },
  {
    accessorKey: 'costPerClick',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 125,
    minSize: 125,
  },
  {
    accessorKey: 'averageOrderValue',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 105,
    minSize: 105,
  },
  {
    accessorKey: 'clickToAddToCartRatio',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 175,
    minSize: 175,
  },
  {
    accessorKey: 'addToCartToPurchaseRatio',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 200,
    minSize: 200,
  },
  {
    accessorKey: 'purchases',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    size: 135,
    minSize: 135,
  },
  {
    accessorKey: 'firstFrameRetention',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 185,
    minSize: 185,
  },
  {
    accessorKey: 'thumbstopRatio',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 145,
    minSize: 145,
  },
  {
    accessorKey: 'clickThroughRateOutbound',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 170,
    minSize: 170,
  },
  {
    accessorKey: 'clickToPurchaseRatio',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 175,
    minSize: 175,
  },
  {
    accessorKey: 'clickThroughRateAll',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 125,
    minSize: 125,
  },
  {
    accessorKey: 'twentyFivePercentVideoPlays',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 200,
    minSize: 200,
  },
  {
    accessorKey: 'fiftyPercentVideoPlays',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 200,
    minSize: 200,
  },
  {
    accessorKey: 'seventyFivePercentVideoPlays',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 200,
    minSize: 200,
  },
  {
    accessorKey: 'oneHundredPercentVideoPlays',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 205,
    minSize: 205,
  },
  {
    accessorKey: 'holdRate',
    header({ column }) {
      const sort = column.getIsSorted()
      return h(
        'button',
        {
          type: 'button',
          onClick: () => column.toggleSorting(sort === 'asc'),
        },
        [
          metricLabels[column.id as keyof Omit<Analytics, 'post'>],
          h('i', {
            class: [
              'bx text-sm ms-2',
              sort === false && 'bx-sort',
              sort === 'asc' && 'bx-sort-up bx-flip-vertical',
              sort === 'desc' && 'bx-sort-down',
            ],
          }),
        ],
      )
    },
    cell: ({ column, getValue }) =>
      formatAnalyticValues({
        key: column.id as keyof Omit<Analytics, 'post'>,
        value: getValue() as number,
      }),
    size: 135,
    minSize: 135,
  },
]
