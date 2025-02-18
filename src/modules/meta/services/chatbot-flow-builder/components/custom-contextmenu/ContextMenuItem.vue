<template>
  <div
    class="select-none rounded-md p-2 font-medium hover:bg-neutral-200"
    @click.stop="(emits('select', $event), emits('hide'))"
    @wheel.stop=""
    @pointerover="(hide.cancel(), (visibleSubitems = true))"
    @pointerleave="hide()"
    @pointerdown.stop=""
  >
    <div class="flex items-center gap-x-1.5">
      <Icon :icon class="size-4" />
      {{ label }}
      <div v-if="subItems && visibleSubitems" class="subitems">
        <ContextMenuItem
          v-for="item in subItems"
          :key="item.key"
          :sub-items="item.subItems"
          :label="item.label"
          :delay
          @select="item.handler"
          @hide="typeof onHide === 'function' ? onHide : () => {}"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItemType } from './types'
import { nodeMapContextMenu } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import { debounce } from 'lodash'
import { computed, ref } from 'vue'

defineOptions({
  name: 'ContextMenuItem',
})

const props = defineProps<{
  subItems: ContextMenuItemType[] | undefined
  delay: number
  label: string
}>()

const emits = defineEmits(['select', 'hide'])

const visibleSubitems = ref(false)
const hide = debounce(() => {
  visibleSubitems.value = false
}, props.delay)

const icon = computed(() => {
  const label = props.label.toLocaleLowerCase()

  if (label === 'delete') return 'bx:trash'
  else if (label === 'clone') return 'bx:duplicate'
  else if (label === 'delete connection') return 'bx:transfer'
  return nodeMapContextMenu[label].icon
})
</script>

<style scoped>
.hasSubitems::after {
  content: '►';
  position: absolute;
  opacity: 0.6;
  right: 5px;
  top: 5px;
}

.subitems {
  position: absolute;
  top: 0;
  left: 100%;
  width: 200px; /* Replace $width variable */
}
</style>
