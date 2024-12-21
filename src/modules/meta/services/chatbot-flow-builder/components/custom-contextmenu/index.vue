<template>
  <div
    class="menu min-h-[40px] bg-white rounded-md shadow-md"
    @mouseover="hide.cancel()"
    @mouseleave="hide()"
    data-testid="context-menu"
    rete-context-menu
  >
    <div v-if="searchBar" class="flex w-full items-center justify-center bg-gray-300">
      <input type="text" v-model="filter" placeholder="Search..." class="w-full p-2" />
    </div>
    <ContextMenuItem
      v-for="item in getItems"
      :key="item.key"
      @select="item.handler($event)"
      :delay="delay"
      @hide="typeof onHide === 'function' ? onHide : () => {}"
      :subitems="item.subitems"
    >
      {{ item.label }}
    </ContextMenuItem>
  </div>
</template>

<script lang="ts" setup>
import ContextMenuItem from './ContextMenuItem.vue'
import type { ContextMenuItemType } from './types'
import { debounce } from 'lodash'
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  items: Array<ContextMenuItemType>,
  delay: Number,
  searchBar: Boolean,
  onHide: Function,
  seed: String,
})

const filter = ref('')
const hide = debounce(() => {
  if (typeof props.onHide === 'function') props.onHide()
}, props.delay)

const getItems = computed(() => {
  const filterRegexp = new RegExp(filter.value, 'i')
  if (!props.items) return []
  return props.items.filter((item) => item.label.match(filterRegexp))
})

onUnmounted(() => {
  hide.cancel()
})
</script>

<style scoped>
.menu {
  padding: 10px;
  width: 200px; /* Replace $width variable */
  margin-top: -20px;
  margin-left: calc(-200px / 2); /* Replace math.div($width, 2) */
}
</style>
