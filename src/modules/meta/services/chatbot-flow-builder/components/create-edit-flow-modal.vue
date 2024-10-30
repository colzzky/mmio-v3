<script setup lang="ts">
import type { ChatBotFlowData } from '@/core/types/MetaTypes'
import { useMetaRelatedStore } from '@/stores/metaRelatedStore'

import type { Flow, FlowsMap } from '../page.vue'
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
import type { Modal } from '@/core/utils/types'
import { inject, reactive } from 'vue'
import { z } from 'zod'
import { useProjectStore } from '@/stores/projectStore'


const metaStore = useMetaRelatedStore()
const useProject = useProjectStore()
const {chat_bot_flow, chat_bot_flow_list} = metaStore 
const { project_data } = useProject

//const flows = inject('flows') as FlowsMap

type SelectedFormKey = Pick<ChatBotFlowData, 'name'>

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; flowId: ChatBotFlowData['cb_id'] }): void
  flowId: ChatBotFlowData['cb_id'] | null
  intent: 'create' | 'edit' | null
  form: SelectedFormKey
  errors: SelectedFormKey
  validated: boolean
  validateForm: () => void
  validateSingleField: (field: keyof SelectedFormKey) => void
  submitForm(): Promise<void>
  createFlow(): Promise<void>
  editFlow(): Promise<void>

}

const schema = z.object({
  name: z.string().min(8, { message: 'Name must be at least 8 characters long' }),
})

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  flowId: null,
  validated: false,
  form: {
    name: '',
  },
  errors: {
    name: '',
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.flowId = null
    this.form = { ...this.form }
    this.errors = { ...this.errors }
  },
  open(args) {
    this.intent = args.intent
    if (args.intent === 'edit') {
      // const flow = flows.value.get(args.flowId)
      // if (!flow) throw new Error('Flow not found')

      // this.flowId = args.flowId
      // this.form = { ...flow }

      console.log('this is edit')
    }

    this.isOpen = true
  },
  close() {
    this.initialState()
  },

  validateForm(): void {
    Object.keys(this.errors).forEach((key) => {
      const field = key as keyof SelectedFormKey
      this.errors[field] = ''
    })

    const result = schema.safeParse(this.form)

    this.validated = result.success

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SelectedFormKey
        this.errors[field] = err.message
      })
    }
    if (this.validated) {
      //Submit or show
    }

  },
  validateSingleField(field: keyof SelectedFormKey): void {
    const value = this.form[field]
    this.errors[field] = ''
    const result = schema.shape[field].safeParse(value)
    if (!result.success) {
      console.log(result.error.errors[0])
      this.errors[field] = result.error.errors[0].message
    }
  },

  async submitForm() {
    this.intent === 'create' ? await  this.createFlow() : await this.editFlow()
    this.close()
  },
  async createFlow() {
    // @temporary: get the highest flow id and increment it by 1
    // const newFlowId = Math.max(...Array.from(flows.value.keys())) + 1
    // flows.value.set(newFlowId, {
    //   ...this.form,
    //   status: 'inactive',
    //   createdAt: new Date(),
    // })
    chat_bot_flow.initialize()
    if(chat_bot_flow.data && project_data.data){
      chat_bot_flow.data.name = this.form.name
      chat_bot_flow.data.pj_id = project_data.data.pj_id
      const create_flow = await chat_bot_flow.createUpdate('new')
      if(create_flow.status){
        chat_bot_flow_list.data.push(create_flow.data)
        console.log(chat_bot_flow_list.data)
      }else{
        console.log('something went wrong adding chatbot flow -' + create_flow.error)
      }
    }
  },
  async editFlow() {
    // if (!this.flowId) throw new Error('No Flow ID value')

    // const flow = flows.value.get(this.flowId)
    // if (!flow) throw new Error('Flow not found')

    // flows.value.set(this.flowId, { ...flow, name: this.form.name })

  },
})

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="gap-y-8">
      <DialogHeader>
        <DialogTitle v-if="modal.intent === 'create'"> Create Flow </DialogTitle>
        <DialogTitle v-else-if="modal.intent === 'edit'"> Edit Flow </DialogTitle>
        <DialogDescription v-if="modal.intent === 'create'">
          Enter the flow details to create a new flow.
        </DialogDescription>
        <DialogDescription v-else-if="modal.intent === 'edit'">
          Enter the flow details to edit this flow.
        </DialogDescription>
      </DialogHeader>
        <div class="flex flex-col gap-y-2">
          <Label for="name">Name</Label>
          <Input type="text" id="name" v-model="modal.form.name" name="name" placeholder="Input Name" required />
        </div>
      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button v-if="modal.intent === 'create'" @click="modal.submitForm()" form="flowForm"> Create </Button>
        <Button v-else-if="modal.intent === 'edit'" @click="modal.submitForm()" form="flowForm"> Edit </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
