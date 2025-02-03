<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'

const authWorkspaceStore = useAuthWorkspaceStore()
const { active_flow } = authWorkspaceStore
</script>

<template>
  <div
    class="fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center rounded-lg border bg-card text-card-foreground"
  >
    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:zoom-in" class="size-6" />
    </Button>
    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:zoom-out" class="size-6" />
    </Button>

    <!-- write and read only -->
    <Button
      v-if="active_flow.ui.read_only_mode"
      type="button"
      size="icon"
      variant="ghost"
      @click="active_flow.ui.enableReadOnly()"
    >
      <Icon icon="mdi:pencil-circle" class="size-12" />
    </Button>
    <Button v-else type="button" size="icon" variant="ghost">
      <Icon icon="bx:book-reader" class="size-12" @click="active_flow.ui.enableReadOnly()" />
    </Button>

    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:undo" class="size-6" />
    </Button>
    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:redo" class="size-6" />
    </Button>
    <Transition name="slide-fade" mode="out-in">
      <div
        v-if="active_flow.ui.read_only_mode"
        class="absolute inset-x-4 bottom-[calc(100%+theme(spacing.2))] flex items-center justify-between rounded-lg bg-neutral-300 px-3 py-1.5 text-sm text-card-foreground"
      >
        <span>Read Mode</span>
        <button
          type="button"
          class="text-blue-500 hover:text-blue-600"
          @click="active_flow.ui.enableReadOnly()"
        >
          Edit
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translatey(20px);
  opacity: 0;
}
</style>
