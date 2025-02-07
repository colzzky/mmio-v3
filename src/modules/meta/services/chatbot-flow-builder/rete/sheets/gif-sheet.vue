<script setup lang="ts">
import { nodeIconMapping } from '../utils'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { SheetHeader, SheetTitle, SheetDescription } from '@/core/components/ui/sheet'
import { toast } from '@/core/components/ui/toast'
import { Node } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { onMounted, reactive, ref, watch } from 'vue'

const authWorkspace = useAuthWorkspaceStore()
const { active_flow, rete_init } = authWorkspace

const localNodeData = ref<Node<'gif_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(active_flow.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'gif_node'>
})

watch(
  () => active_flow.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'gif_node'>
    }
  },
)

const gifDialog = reactive({
  isOpen: false,
  initialState() {
    this.isOpen = false
  },
  open() {
    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  selectGIF(url: string) {
    if (!localNodeData.value?.data) return

    localNodeData.value.data.image = url

    this.initialState()
  },
})

function handleRemoveDelay() {
  if (!localNodeData.value?.data) return

  localNodeData.value.data.delay = '0'

  toast({
    title: 'Removed delay',
    variant: 'success',
    duration: 2000,
  })
}

function handleClearGIF() {
  if (!localNodeData.value?.data) return

  localNodeData.value.data.image = ''

  toast({
    title: 'Cleared GIF',
    variant: 'success',
    duration: 2000,
  })
}
</script>

<template>
  <template v-if="localNodeData && localNodeData.data">
    <SheetHeader
      class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
    >
      <Icon
        :icon="nodeIconMapping[localNodeData.label]"
        class="row-span-full size-[var(--icon-size)] self-center"
      />
      <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
      <SheetDescription class="leading-none">GIF</SheetDescription>
    </SheetHeader>
    <main class="grid gap-y-4 px-6 py-3">
      <div>
        <Label for="name">Name</Label>
        <Input
          v-model:model-value="localNodeData.data.name"
          id="name"
          type="text"
          name="name"
          placeholder="What do you call this node?"
        />
      </div>
      <div class="text-sm">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">Delay</h3>
          <button type="button" class="font-medium text-destructive" @click="handleRemoveDelay">
            Remove Delay
          </button>
        </div>
        <div class="flex items-center gap-x-4">
          <Input
            v-model:model-value="localNodeData.data.delay"
            id="delay"
            type="range"
            name="delay"
            min="0"
            max="10"
            default-value="0"
          />
          <span class="whitespace-nowrap">
            {{ localNodeData.data.delay ?? '0' }}
            seconds
          </span>
        </div>
      </div>
      <div>
        <Label for="gif">GIF</Label>
        <div class="relative aspect-video rounded border-[3px] border-dashed p-1">
          <small
            v-if="!localNodeData.data.image"
            class="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-balance text-center text-muted-foreground"
          >
            Drag and drop GIF here
          </small>
          <img v-else :src="localNodeData.data.image" alt="" />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        class="border-2 border-dashed"
        @click="gifDialog.open()"
      >
        Choose a GIF
      </Button>
      <div class="grid gap-y-2">
        <Button variant="destructive" @click="handleClearGIF">Clear GIF</Button>
      </div>
    </main>

    <Dialog :open="gifDialog.isOpen" @update:open="gifDialog.close()">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose a GIF</DialogTitle>
          <DialogDescription>
            Choose the appropriate GIF from the examples below.
          </DialogDescription>
        </DialogHeader>
        <main class="grid gap-y-4">
          <div class="flex items-center gap-x-2">
            <Button type="button" variant="outline">Previous</Button>
            <div class="relative grow">
              <Icon
                icon="bx:search"
                class="absolute left-0 top-1/2 size-5 -translate-y-1/2 translate-x-1/2 text-muted-foreground"
              />
              <Input v-model="localNodeData.data.image" placeholder="Search GIFs..." class="ps-8" />
            </div>
            <Button type="button">Next</Button>
          </div>
          <div class="grid grid-cols-4 gap-4">
            <article v-for="key in 8" :key class="group relative">
              <img
                src="https://s3-alpha-sig.figma.com/img/9bba/75fa/ea8651d779e263b821d4a300400d1139?Expires=1739750400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=uJQ~1zVaFZlldCMSAR20lDCdwGsDlpX1YSyRfFoobKSp2Lj9hp2TxlDyD2mpzyMt2PX4ba1e~Eisa3lJIawi-PlY5MpGJXHD2Gbn7ItbLuygAArNWb0loa~GS9AY5fuSO00CA32vUFt5YhWyo-OCDRtamQ0B0g0zozX3lVONEb-tCFGhbFdkOTDterpalhsjTfWpvwnCliF8ma8zrzHuvAvjCLrC75a62wp6xNOJ4BwMGA-C-8DnswLXpBlaAu9pZ4eXwoCuYWhvMWtyBM2gky~ViU2iTFQZRO8qbHinVk-YRIne0h285sYLlxGLuj0wX7-zHNjYNfscOTW6sDv1VQ__"
                class="transition-[filter] group-hover:blur-sm"
              />
              <Button
                type="button"
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                @click="
                  gifDialog.selectGIF(
                    'https://s3-alpha-sig.figma.com/img/9bba/75fa/ea8651d779e263b821d4a300400d1139?Expires=1739750400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=uJQ~1zVaFZlldCMSAR20lDCdwGsDlpX1YSyRfFoobKSp2Lj9hp2TxlDyD2mpzyMt2PX4ba1e~Eisa3lJIawi-PlY5MpGJXHD2Gbn7ItbLuygAArNWb0loa~GS9AY5fuSO00CA32vUFt5YhWyo-OCDRtamQ0B0g0zozX3lVONEb-tCFGhbFdkOTDterpalhsjTfWpvwnCliF8ma8zrzHuvAvjCLrC75a62wp6xNOJ4BwMGA-C-8DnswLXpBlaAu9pZ4eXwoCuYWhvMWtyBM2gky~ViU2iTFQZRO8qbHinVk-YRIne0h285sYLlxGLuj0wX7-zHNjYNfscOTW6sDv1VQ__',
                  )
                "
              >
                Select GIF
              </Button>
            </article>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  </template>
</template>
