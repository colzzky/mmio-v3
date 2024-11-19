<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Dialog from '@/core/components/ui/dialog/Dialog.vue'
import DialogContent from '@/core/components/ui/dialog/DialogContent.vue'
import DialogTitle from '@/core/components/ui/dialog/DialogTitle.vue'
import Input from '@/core/components/ui/input/Input.vue'
import { reactive, watch } from 'vue'

const props = defineProps<{ open_modal: boolean }>()

const emit = defineEmits<{
  (e: 'return', value: boolean): void
}>()

watch(
  () => props.open_modal,
  (newTrigger) => {
    if (newTrigger) {
      create_permission_modal.isOpen = true
    }
  },
)

const create_permission_modal = reactive({
  isOpen: false,
  steps: '',
  data: {},
  processing_msg: '',
  async continue() {},
  previous() {},
  close() {
    this.isOpen = false
    emit('return', false)
  },
  async createWorkspace() {},
})
</script>

<template>
  <Dialog v-model:open="create_permission_modal.isOpen">
    <DialogContent @interact-outside="(e) => e.preventDefault()" class="min-h-[75%] sm:max-w-[75%]">
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <div>
        <div class="flex justify-end">
          <div>
            <button
              class="right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <i class="material-icons">close</i>
            </button>
          </div>
        </div>
        <!-- This part is changing -->
        <div class="container mx-auto pt-10">
          <div class="grid grid-cols-2 gap-5">
            <div class="col-span-1 space-y-10">
              <div
                class="text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-5xl font-bold text-transparent"
              >
                Let’s create your new workspace!
              </div>
              <div class="pt-5">
                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span class="w-96 flex-none"
                      >Upon creation of new workspace it mean you agreed to our
                      <span class="font-bold text-blue-500">terms and conditions.</span></span
                    >
                    <Button
                      @click="create_permission_modal.close()"
                      class="bg-red-500 text-white hover:bg-red-700"
                      >Continue</Button
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-1 mx-10">
              <div class="flex items-center justify-center">
                <img src="@/assets/undraw_deconstructed_alud.svg" alt="Centered SVG" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
