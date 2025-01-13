<template>
  <div class="select-none rounded-md p-2 font-medium hover:bg-neutral-200">
    <div
      class="flex items-center gap-x-1.5"
      @click.stop="(emits('select', $event), emits('hide'))"
      @wheel.stop=""
      @pointerover="(hide.cancel(), (visibleSubitems = true))"
      @pointerleave="hide()"
      @pointerdown.stop=""
    >
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
import { nodeIconMapping } from '../../rete/utils'
import type { ContextMenuItemType } from './types'
import type { NodeType } from '@/modules/meta/utils/flow-types'
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

const labelMapping: Record<string, keyof NodeType> = {
  reference: 'reference_node',
  message: 'message_node',
  generic: 'generic_node',
  carousel: 'carousel_node',
  media: 'media_node',
  trigger: 'trigger_node',
  condition: 'condition_node',
  image: 'image_node',
}

const icon = computed(() => {
  const label = props.label.toLocaleLowerCase()

  if (label === 'delete') return 'bx:trash'
  else if (label === 'clone') return 'bx:duplicate'

  return nodeIconMapping[labelMapping[label]]
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
