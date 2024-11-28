<script setup lang="ts">
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
import { PermissionServices } from '@/core/types/PermissionTypes'
import { chatbot_flow_service_Data } from '@/core/types/WorkSpaceTypes'
import { PermissionAccessError, servicePermission } from '@/core/utils/permissionHelpers'
import type { ChatbotFlowServiceData, Modal } from '@/core/utils/types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { reactive, ref } from 'vue'
import { z, type ZodRawShape } from 'zod'

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create', flowId: ChatbotFlowServiceData['cb_id'] | null } | { intent: 'edit'; flowId: ChatbotFlowServiceData['cb_id'] | null }): void
  flowId: ChatbotFlowServiceData['cb_id'] | null
  intent: 'create' | 'edit' | null
  validated: boolean
  submitForm(): Promise<void>
  createFlow(): Promise<void>
  editFlow(): Promise<void>
}
type ChatbotflowFields = Pick<ChatbotFlowServiceData, 'name'>

const authWorkspaceStore = useAuthWorkspaceStore()
const { service_models, workspace_service, imported_meta_pages } = authWorkspaceStore
const { chatbot_flow } = workspace_service
const { chatbot_flow: chatbot_flow_md } = service_models
const chatbot_flow_data = ref<ChatbotFlowServiceData | null>(null)

const flow_form = reactive({
  inputs: <ChatbotflowFields>{ name: '' },
  errors: <ChatbotflowFields>{ name: '' },
  schema: <ZodRawShape>{
    name: z.string().min(8, { message: 'Chatbot flow name must be at least 8 characters long' }),
  },

  validateSingleField(field: keyof ChatbotflowFields): void {
    const value = this.inputs[field]
    this.errors[field] = ''
    const result = z.object(this.schema as ZodRawShape).shape[field].safeParse(value)
    if (!result.success) {
      console.log(result.error.errors[0])
      this.errors[field] = result.error.errors[0].message
    }
  },
  async validateDataInput(): Promise<boolean> {
    Object.keys(this.errors).forEach((key) => {
      const field = key as keyof ChatbotflowFields
      this.errors[field] = ''
    })
    const result = z.object(this.schema as ZodRawShape).safeParse(this.inputs)

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChatbotflowFields
        this.errors[field] = err.message
      })
      return false
    } else {
      return true
    }
  },
  initializeForm() {

    if (chatbot_flow_data.value) {
      this.inputs = { name: chatbot_flow_data.value.name }
    }

    this.errors = { name: '' }
  },
  reset() {
    this.inputs = { name: '' }
    this.errors = { name: '' }
  }
})

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  flowId: null,
  validated: false,
  initialState() {
    this.isOpen = false
    this.intent = null
    this.flowId = null
  },
  async open(args) {
    try {
      //Check Permission
      await servicePermission.check(PermissionServices.ChatBotFlow, ['add', 'publish', 'edit'])
      
      this.intent = args.intent
      this.flowId = args.flowId
      if (args.intent === 'edit' && this.flowId) {
        const find_chatbot = chatbot_flow.data.find(flow => flow.cb_id == this.flowId)
        if (!find_chatbot) {
          return;
        } else {
          chatbot_flow_data.value = JSON.parse(JSON.stringify(find_chatbot))
        }
      } else {
        chatbot_flow_data.value = JSON.parse(JSON.stringify(chatbot_flow_service_Data))
      }
      flow_form.initializeForm()
      this.isOpen = true

    } catch (error: any) {
      if (error instanceof PermissionAccessError) {
        this.isOpen = false
        return;
      }
    }
  },
  close() {
    chatbot_flow_data.value = null
    flow_form.reset()
    this.initialState()

  },

  async submitForm() {
    const validate = await flow_form.validateDataInput()
    if (validate) {
      const updated_chatbot = <ChatbotFlowServiceData>{ ...chatbot_flow_data.value, ...flow_form.inputs }
      chatbot_flow_data.value = updated_chatbot
      console.log(updated_chatbot)
      this.intent === 'create' ? await this.createFlow() : await this.editFlow()
      this.close()
    } else {
      console.log('not valid')
    }
  },
  async createFlow() {
    if (chatbot_flow_data.value) {
      chatbot_flow_md.reInit()
      chatbot_flow_md.set(chatbot_flow_data.value)
      const create = await chatbot_flow_md.createUpdate('new')
      if (create.status) {
        chatbot_flow.data.push(chatbot_flow_md.data)
      }
    }

  },
  async editFlow() {
    if (chatbot_flow_data.value) {
      chatbot_flow_md.reInit()
      chatbot_flow_md.set(chatbot_flow_data.value)
      const update = await chatbot_flow_md.createUpdate('update')
      if (update.status) {
        const chatbot_index = chatbot_flow.data.findIndex(flow => flow.cb_id === this.flowId)
        if (chatbot_index >= 0) {
          chatbot_flow.data[chatbot_index] = JSON.parse(JSON.stringify(chatbot_flow_md.data))
        }
      }
    }
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
        <template v-if="modal.intent === 'create'">
          <DialogTitle>Create Flow</DialogTitle>
          <DialogDescription> Enter the flow details to create a new flow. </DialogDescription>
        </template>
        <template v-else>
          <DialogTitle>Edit Flow</DialogTitle>
          <DialogDescription> Enter the flow details to edit this flow. </DialogDescription>
        </template>
      </DialogHeader>
      <div class="flex flex-col gap-y-2">
        <Label for="name">Name</Label>
        <Input type="text" id="name" v-model="flow_form.inputs.name" name="name" placeholder="Input Name" required />
        <div v-if="flow_form.errors.name" for="name" class="flex items-center gap-1 text-xs text-red-500">
          <i class="material-icons text-sm">error</i>
          {{ flow_form.errors.name }}
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button v-if="modal.intent === 'create'" @click="modal.submitForm()" form="flowForm">
          Create
        </Button>
        <Button v-else-if="modal.intent === 'edit'" @click="modal.submitForm()" form="flowForm">
          Edit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
