<template>
  <div
    class="min-w-48 rounded-xl border-2 border-neutral-200 bg-neutral-100 p-2 text-sm shadow-sm"
    @mouseover="hide.cancel"
    @mouseleave="hide"
    data-testid="context-menu"
    rete-context-menu
    @dblclick.stop=""
  >
    <div v-if="searchBar" class="relative mb-2 rounded-md bg-white [--icon-size:theme(spacing.5)]">
      <Icon
        icon="bx:search"
        class="absolute left-0 top-1/2 size-[var(--icon-size)] -translate-y-1/2 translate-x-2"
      />
      <input
        v-model="filter"
        type="search"
        placeholder="Search Template..."
        class="rounded-md border border-input bg-transparent py-2 ps-[calc(theme(spacing.2)+var(--icon-size)+theme(spacing.2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ref="search"
      />
    </div>
    <ContextMenuItem
      v-for="item in getItems"
      :key="item.key"
      :sub-items="item.subItems"
      :label="item.label"
      :delay
      @select="handler($event, item)"
      @hide="typeof onHide === 'function' ? onHide : () => {}"
    />
  </div>
</template>

<script lang="ts" setup>
import ContextMenuItem from './ContextMenuItem.vue'
import type { ContextMenuItemType } from './types'
import { Icon } from '@iconify/vue'
import { debounce } from 'lodash'
import { ref, computed, onUnmounted, onMounted, useTemplateRef } from 'vue'

const props = defineProps<{
  items: ContextMenuItemType[]
  delay: number
  searchBar: boolean
  onHide: Function
  seed: number
}>()

const filter = ref('')
const hide = debounce(() => {
  if (typeof props.onHide === 'function') props.onHide()
}, props.delay)

const handler = (event: MouseEvent, item: ContextMenuItemType) => {
  item.handler(event)
  console.log(item)
  props.onHide()
}

const getItems = computed(() => {
  const filterRegexp = new RegExp(filter.value, 'i')
  if (!props.items) return []
  return props.items.filter((item) => item.label.match(filterRegexp))
})

onUnmounted(() => {
  console.log('unmounted')
  hide.cancel()
})

// input autofocus upon mounted
const searchRef = useTemplateRef('search')
onMounted(() => {
  if (!searchRef.value) return
  searchRef.value.focus()
})
</script>
