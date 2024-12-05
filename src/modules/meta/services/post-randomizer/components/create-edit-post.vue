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
import Textarea from '@/core/components/ui/textarea/Textarea.vue'
import { toast } from '@/core/components/ui/toast'
import { PermissionServices } from '@/core/types/PermissionTypes'
import { post_randomizer_posts_data } from '@/core/types/WorkSpaceTypes'
import { PermissionAccessError, servicePermission } from '@/core/utils/permissionHelpers'
import type { Modal, PostRandomizerPostsData, PostRandomizerServiceData } from '@/core/utils/types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { reactive, ref } from 'vue'
import { z, type ZodRawShape } from 'zod'

interface ModalInterface extends Omit<Modal, 'open'> {
  open(
    args:
      | {
          intent: 'create'
          prId: PostRandomizerServiceData['pr_id']
          postData: PostRandomizerPostsData | null
        }
      | {
          intent: 'edit'
          prId: PostRandomizerServiceData['pr_id']
          postData: PostRandomizerPostsData | null
        },
  ): void
  prId: PostRandomizerServiceData['pr_id']
  postData: PostRandomizerPostsData | null
  intent: 'create' | 'edit' | null
  validated: boolean
  submitLoad: boolean
  submitForm(): Promise<void>
  createPost(): Promise<void>
  editPost(): Promise<void>
}
type CampaignPostField = Pick<PostRandomizerPostsData, 'postName' | 'content' | 'mediaSource'>
type CampaignPostErrors = {
  [Key in keyof Pick<PostRandomizerPostsData, 'postName' | 'content' | 'mediaSource'>]: string
}

const authWorkspaceStore = useAuthWorkspaceStore()
const { service_models, current_member, active_workspace } = authWorkspaceStore
const { post_randomizer_posts: post_randomizer_post_md } = service_models
const post_randomizer_post = ref<PostRandomizerPostsData | null>(null)
const emit = defineEmits<{
  (e: 'return', value: PostRandomizerPostsData): void
}>()

const content_form = reactive({
  inputs: { postName: '', content: '', mediaSource: [] } as CampaignPostField,
  errors: { postName: '', content: '', mediaSource: '' } as CampaignPostErrors,
  schema: {
    postName: z.string().min(8, { message: 'Content name must be at least 8 characters long' }),
    content: z.string().min(8, { message: 'Content must be at least 8 characters long' }),
  } as ZodRawShape,

  validateSingleField(field: keyof CampaignPostField): void {
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
      const field = key as keyof CampaignPostField
      this.errors[field] = ''
    })
    const result = z.object(this.schema as ZodRawShape).safeParse(this.inputs)

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CampaignPostField
        this.errors[field] = err.message
      })
      return false
    } else {
      return true
    }
  },
  initializeForm() {
    if (post_randomizer_post.value) {
      this.inputs = {
        postName: post_randomizer_post.value.postName,
        content: post_randomizer_post.value.postName,
        mediaSource: post_randomizer_post.value.mediaSource,
      }
    }
    this.errors = { postName: '', content: '', mediaSource: '' }
  },
  reset() {
    this.inputs = { postName: '', content: '', mediaSource: [] }
    this.errors = { postName: '', content: '', mediaSource: '' }
  },
})

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  postData: null,
  prId: '',
  validated: false,
  submitLoad: false,
  initialState() {
    this.isOpen = false
    this.intent = null
    this.postData = null
  },
  async open(args) {
    try {
      //Check Permission
      await servicePermission.check(PermissionServices.ChatBotFlow, ['add', 'publish', 'edit'])
      this.intent = args.intent
      this.prId = args.prId
      this.postData = args.postData
      post_randomizer_post.value = this.postData
        ? this.postData
        : JSON.parse(JSON.stringify(post_randomizer_posts_data))
      content_form.initializeForm()
      this.isOpen = true
    } catch (error: any) {
      if (error instanceof PermissionAccessError) {
        this.isOpen = false
        return
      }
    }
  },
  close() {
    post_randomizer_post.value = null
    this.submitLoad = false
    content_form.reset()
    this.initialState()
  },

  async submitForm() {
    this.submitLoad = true
    const validate = await content_form.validateDataInput()
    if (validate) {
      const updated_post = {
        ...post_randomizer_post.value,
        ...content_form.inputs,
      } as PostRandomizerPostsData
      post_randomizer_post.value = updated_post
      console.log(updated_post)
      this.intent === 'create' ? await this.createPost() : await this.editPost()
      emit('return', post_randomizer_post.value)
      this.close()
    } else {
      toast({
        title: 'Something went wrong',
        variant: 'destructive',
        duration: 2000,
      })
    }
    this.submitLoad = false
  },
  async createPost() {
    if (post_randomizer_post.value) {
      post_randomizer_post_md.reInit()
      post_randomizer_post_md.set(post_randomizer_post.value)
      post_randomizer_post_md.data.createdBy = current_member.data
        ? current_member.data.uid
        : active_workspace.data
          ? active_workspace.data.owner_uid
          : ''
      const create = await post_randomizer_post_md.createUpdate(this.prId, 'new')
      if (create.status) {
        post_randomizer_post.value = { ...create.data }
        toast({
          title: 'Record has been Created',
          variant: 'success',
          duration: 2000,
        })
      }
    }
  },
  async editPost() {
    if (post_randomizer_post.value) {
      post_randomizer_post_md.reInit()
      post_randomizer_post_md.set(post_randomizer_post.value)
      const update = await post_randomizer_post_md.createUpdate(this.prId, 'update')
      if (update.status) {
        post_randomizer_post.value = { ...update.data }
        toast({
          title: 'Record has been Updated',
          variant: 'success',
          duration: 2000,
        })
        //Do something here
      }
    }
  },
})

const files = ref<File[]>([])
const isDragging = ref(false)

// Handle file drop
const handleDrop = (event: DragEvent) => {
  const droppedFiles = event.dataTransfer?.files
  if (droppedFiles) {
    for (let i = 0; i < droppedFiles.length; i++) {
      files.value.push(droppedFiles[i])
    }
  }
  isDragging.value = false
}

// Handle file selection
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      files.value.push(input.files[i])
    }
  }
}

// Remove file
const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="gap-y-4">
      <DialogHeader>
        <template v-if="modal.intent === 'create'">
          <DialogTitle>Create Post Randomizer</DialogTitle>
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
        <Input v-model="content_form.inputs.postName" placeholder="Input Name" required />
        <div
          v-if="content_form.errors.postName"
          for="name"
          class="flex items-center gap-1 text-xs text-red-500"
        >
          <i class="material-icons text-sm">error</i>
          {{ content_form.errors.postName }}
        </div>
      </div>
      <div class="flex flex-col gap-y-2">
        <Label for="name">Content</Label>
        <Textarea
          v-model="content_form.inputs.content"
          placeholder="What do you want to post?"
          required
        />
        <div
          v-if="content_form.errors.content"
          for="name"
          class="flex items-center gap-1 text-xs text-red-500"
        >
          <i class="material-icons text-sm">error</i>
          {{ content_form.errors.content }}
        </div>
      </div>
      <div class="flex flex-col gap-y-2">
        <Label for="name">File Content</Label>
        <div class="rounded-lg border-2 border-dashed border-gray-300 p-6">
          <div
            class="relative flex flex-col items-center justify-center text-center"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            :class="{ 'bg-gray-100': isDragging }"
          >
            <div>
              <input
                type="file"
                class="absolute inset-0 cursor-pointer opacity-0"
                multiple
                @change="handleFileSelect"
              />
              <p class="text-gray-500">Drag & drop your files here or click to upload.</p>
            </div>
            <div class="mt-4 text-sm text-gray-400">(Accepted formats: PNG, JPG, MP4)</div>
          </div>
          <ul v-if="files.length > 0" class="mt-4 w-full">
            <li
              v-for="(file, index) in files"
              :key="index"
              class="mb-2 flex items-center justify-between rounded-md border bg-gray-50 p-2"
            >
              <span class="truncate">{{ file.name }}</span>
              <Button
                variant="ghost"
                @click="removeFile(index)"
                class="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            </li>
          </ul>
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button v-if="modal.intent === 'create' && !modal.submitLoad" @click="modal.submitForm()">
          Create
        </Button>
        <Button
          v-else-if="modal.intent === 'edit' && !modal.submitLoad"
          @click="modal.submitForm()"
        >
          Update
        </Button>
        <Button
          v-else-if="modal.submitLoad"
          variant="outline"
          size="xs"
          disabled
          class="flex items-center gap-2"
        >
          <i class="material-icons animate-spin text-sm">donut_large</i>Update/Creating your post
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
