<template>
  <div class="block" :class="[subitems ? 'hasSubitems' : '']">
    <div
      class="content text-gray-800"
      @click.stop="(emits('select', $event), emits('hide'))"
      @wheel.stop=""
      @pointerover="(hide.cancel(), (visibleSubitems = true))"
      @pointerleave="hide()"
      @pointerdown.stop=""
    >
      <slot />
      <div v-if="subitems && visibleSubitems" class="subitems">
        <ContextMenuItem
          v-for="item in subitems"
          :key="item.key"
          @select="item.handler($event)"
          :delay="delay"
          @hide="emits('hide')"
          :subitems="item.subitems"
        >
          {{ item.label }}
        </ContextMenuItem>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItemType } from './types'
import { debounce } from 'lodash'
import { ref } from 'vue'

defineOptions({
  name: 'ContextMenuItem',
})

const props = defineProps({
  subitems: Array<ContextMenuItemType>,
  delay: Number,
})

const emits = defineEmits(['select', 'hide'])

const visibleSubitems = ref(false)
const hide = debounce(() => {
  visibleSubitems.value = false
}, props.delay)
</script>

<style scoped>
.block {
  padding: 0;
}

.content {
  padding: 4px;
}

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
