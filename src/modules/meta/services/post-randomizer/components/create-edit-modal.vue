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
import { post_randomizer_service_data } from '@/core/types/WorkSpaceTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { postCollection } from '@/core/utils/firebase-collections'
import { PermissionAccessError, servicePermission } from '@/core/utils/permissionHelpers'
import type { Modal, PostRandomizerServiceData } from '@/core/utils/types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { reactive, ref } from 'vue'
import { z, type ZodRawShape } from 'zod'

interface ModalInterface extends Omit<Modal, 'open'> {
  open(
    args:
      | { intent: 'create'; prId: PostRandomizerServiceData['pr_id'] | null }
      | { intent: 'edit'; prId: PostRandomizerServiceData['pr_id'] | null },
  ): void
  prId: PostRandomizerServiceData['pr_id'] | null
  intent: 'create' | 'edit' | null
  validated: boolean
  submitForm(): Promise<void>
  createCampaign(): Promise<void>
  editCampaign(): Promise<void>
}
type PostRandomizerFields = Pick<PostRandomizerServiceData, 'name'>

const authWorkspaceStore = useAuthWorkspaceStore()
const { service_models, workspace_service, active_workspace } = authWorkspaceStore
const { post_randomizer } = workspace_service
const { post_randomizer: post_randomizer_md } = service_models
const post_randomizer_data = ref<PostRandomizerServiceData | null>(null)

const randomizer_form = reactive({
  inputs: { name: '' } as PostRandomizerFields,
  errors: { name: '' } as PostRandomizerFields,
  schema: {
    name: z.string().min(8, { message: 'Chatbot flow name must be at least 8 characters long' }),
  } as ZodRawShape,

  validateSingleField(field: keyof PostRandomizerFields): void {
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
      const field = key as keyof PostRandomizerFields
      this.errors[field] = ''
    })
    const result = z.object(this.schema as ZodRawShape).safeParse(this.inputs)

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof PostRandomizerFields
        this.errors[field] = err.message
      })
      return false
    } else {
      return true
    }
  },
  initializeForm() {
    if (post_randomizer_data.value) {
      this.inputs = { name: post_randomizer_data.value.name }
    }

    this.errors = { name: '' }
  },
  reset() {
    this.inputs = { name: '' }
    this.errors = { name: '' }
  },
})

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  prId: null,
  validated: false,
  initialState() {
    this.isOpen = false
    this.intent = null
    this.prId = null
  },
  async open(args) {
    try {
      //Check Permission
      await servicePermission.check(PermissionServices.ChatBotFlow, ['add', 'publish', 'edit'])

      this.intent = args.intent
      this.prId = args.prId
      if (args.intent === 'edit' && this.prId) {
        const find_post_randomizer = post_randomizer.data.find((rand) => rand.pr_id == this.prId)
        if (!find_post_randomizer) {
          return
        } else {
          post_randomizer_data.value = JSON.parse(JSON.stringify(find_post_randomizer))
        }
      } else {
        post_randomizer_data.value = JSON.parse(JSON.stringify(post_randomizer_service_data))
      }
      randomizer_form.initializeForm()
      this.isOpen = true
    } catch (error: any) {
      if (error instanceof PermissionAccessError) {
        this.isOpen = false
        return
      }
    }
  },
  close() {
    post_randomizer_data.value = null
    randomizer_form.reset()
    this.initialState()
  },

  async submitForm() {
    const validate = await randomizer_form.validateDataInput()
    if (validate) {
      const updated_post = {
        ...post_randomizer_data.value,
        ...randomizer_form.inputs,
      } as PostRandomizerServiceData
      post_randomizer_data.value = updated_post
      console.log(updated_post)
      this.intent === 'create' ? await this.createCampaign() : await this.editCampaign()
      this.close()
    } else {
      console.log('not valid')
    }
  },
  async createCampaign() {
    if (post_randomizer_data.value && active_workspace.data) {
      post_randomizer_md.reInit()
      post_randomizer_md.set(post_randomizer_data.value)
      const create = await postCollection(DbCollections.ws_post_randomizer,
        {
          data:post_randomizer_data.value,
          idKey:'pr_id',
          $sub_params:{
            ws_id:active_workspace.data.ws_id
          }
        }
      )
      if (create.status && create.data) {
        post_randomizer.data.push({ ...create.data })
      }
    }
  },
  async editCampaign() {
    if (post_randomizer_data.value && active_workspace.data) {
      post_randomizer_md.reInit()
      post_randomizer_md.set(post_randomizer_data.value)
      const update = await postCollection(DbCollections.ws_post_randomizer,
        {
          data:post_randomizer_data.value,
          idKey:'pr_id',
          $sub_params:{
            ws_id:active_workspace.data.ws_id
          }
        }
      )
      if (update.status) {
        const post_randomizer_index = post_randomizer.data.findIndex(
          (rand) => rand.pr_id === this.prId,
        )
        if (post_randomizer_index >= 0) {
          post_randomizer.data[post_randomizer_index] = JSON.parse(
            JSON.stringify(post_randomizer_md.data),
          )
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
          <DialogTitle>Create Post Randomizer Campaign</DialogTitle>
          <DialogDescription>
            Enter the post randomizer Name and we'll redirect you after.
          </DialogDescription>
        </template>
        <template v-else>
          <DialogTitle>Change Post Randomizer Name</DialogTitle>
          <DialogDescription> Enter the flow details to edit this flow. </DialogDescription>
        </template>
      </DialogHeader>
      <div class="flex flex-col gap-y-2">
        <Label for="name">Name</Label>
        <Input
          type="text"
          id="name"
          v-model="randomizer_form.inputs.name"
          name="name"
          placeholder="Input Name"
          required
        />
        <div
          v-if="randomizer_form.errors.name"
          for="name"
          class="flex items-center gap-1 text-xs text-red-500"
        >
          <i class="material-icons text-sm">error</i>
          {{ randomizer_form.errors.name }}
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
