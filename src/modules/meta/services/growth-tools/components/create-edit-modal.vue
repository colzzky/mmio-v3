<script setup lang="ts">
import type { GrowthTool, GrowthToolMap } from '../page.vue'
import { GrowthToolType } from '../utils'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import type { Modal } from '@/core/utils/types'
import { inject, reactive } from 'vue'

const growthTools = inject('growthTools') as GrowthToolMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; growthToolId: GrowthTool['id'] }): void

  intent: 'create' | 'edit' | null
  form: Omit<GrowthTool, 'createdAt'>
  submitForm(): void
  createGrowthTool(): void
  editGrowthTool(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  form: {
    id: 0,
    name: '',
    type: 'Checkbox Plugin',
    page: '',
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.form = {
      id: 0,
      name: '',
      type: 'Checkbox Plugin',
      page: '',
    }
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'edit') {
      const growthTool = growthTools.value.get(args.growthToolId)
      if (!growthTool) throw new Error('Growth tool not found')

      this.form = {
        id: growthTool.id,
        name: growthTool.name,
        type: growthTool.type,
        page: growthTool.page,
      }
    }

    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  submitForm() {
    this.intent === 'create' ? this.createGrowthTool() : this.editGrowthTool()
    this.close()
  },
  createGrowthTool() {
    // @temporary: get the highest growth tool id and increment it by 1
    const newGrowthToolId = Math.max(...Array.from(growthTools.value.keys())) + 1
    growthTools.value.set(newGrowthToolId, {
      ...this.form,
      id: newGrowthToolId,
      createdAt: new Date(),
    })
  },
  editGrowthTool() {
    const growthTool = growthTools.value.get(this.form.id)
    if (!growthTool) throw new Error('Growth tool not found')

    growthTools.value.set(this.form.id, {
      ...this.form,
      createdAt: growthTool.createdAt,
    })
  },
})

defineExpose({ modal })
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent>
      {{ modal }}
      <DialogHeader>
        <template v-if="modal.intent === 'create'">
          <DialogTitle>Create Growth Tool</DialogTitle>
          <DialogDescription>
            Enter the growth tool details to create a new growth tool.
          </DialogDescription>
        </template>
        <template v-else>
          <DialogTitle>Edit Growth Tool</DialogTitle>
          <DialogDescription>
            Enter the growth tool details to edit this growth tool.
          </DialogDescription>
        </template>
      </DialogHeader>
      <form id="form" class="grid gap-y-4" @submit.prevent="modal.submitForm()">
        <div class="flex flex-col gap-y-2">
          <Label for="name">Name</Label>
          <Input
            type="text"
            id="name"
            v-model="modal.form.name"
            name="name"
            placeholder="Input Name"
            required
          />
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="type">Type</Label>
          <Select id="type" v-model:model-value="modal.form.type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="type in GrowthToolType" :key="type" :value="type">
                    {{ type }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="page">Page</Label>
          <Select id="page" v-model:model-value="modal.form.page" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a page" />
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="MarketingMaster.io">MarketingMaster.io</SelectItem>
                  <SelectItem value="Page Foo">Page Foo</SelectItem>
                  <SelectItem value="Page Bar">Page Bar</SelectItem>
                  <SelectItem value="Page Baz">Page Baz</SelectItem>
                </SelectGroup>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>
      </form>
      <DialogFooter>
        <DialogFooter>
          <Button variant="secondary" @click="modal.close()">Cancel</Button>
          <Button type="submit" form="form">
            {{ modal.intent === 'create' ? 'Create' : 'Edit' }}
          </Button>
        </DialogFooter>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
