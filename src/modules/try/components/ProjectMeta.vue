<script lang="ts" setup>
import { Button } from '@/core/components/ui/button'
import Combobox from '@/core/components/ui/combobox.vue'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import Input from '@/core/components/ui/input/Input.vue'
import { Skeleton } from '@/core/components/ui/skeleton'
import { useToast } from '@/core/components/ui/toast'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { useProjectCenter } from '@/stores/projectCenter'
import { useProjectStore } from '@/stores/projectStore'
import { onMounted, reactive, ref } from 'vue'
import { z } from 'zod'

const { toast } = useToast()
const useProject = useProjectStore()
const useAuth = useAuthStore()
const { project_data } = useProject
const { user_auth } = useAuth
//Requirement when setting up Component
const componentLoad = ref<boolean>(true)
const project_center = useProjectCenter()
const { project_center_dialog: pcd } = project_center

const samplePage_id = ['1232', '1332', '14323']
const sampleOptions = [
  {
    label: '1232',
    value: '1232',
  },
  {
    label: '1332',
    value: '1332',
  },
  {
    label: '14323',
    value: '14323',
  },
]

interface InputStructure {
  name: string
  platform: string
  account: string //Id of the fb page or IG Account etc
}

interface InputField {
  dataInput: InputStructure
  errors: InputStructure
  validated: boolean
  isLoading: boolean
  confirmationModal: boolean
  initializeValue: () => void
  openCloseConfirmation: () => void
  createProject: () => Promise<void>
  validateDataInput: () => Promise<void>
  validateSingleField: (field: keyof InputStructure) => void
}

const schema = z.object({
  name: z.string().min(1, { message: 'name is required' }),
  platform: z.string().min(1, { message: 'Platform is required' }),
  account: z.enum(samplePage_id as [string, ...string[]], {
    errorMap: () => ({ message: 'Selected choice must be one of the available options' }),
  }),
})

//initial input
let inputStructure: InputStructure = {
  name: '',
  platform: '',
  account: '',
}

const inputField = reactive<InputField>({
  dataInput: { ...inputStructure },
  errors: { ...inputStructure },
  validated: false,
  isLoading: false,
  confirmationModal: false,
  initializeValue(): void {
    this.dataInput.platform = 'META'
  },
  validateSingleField(field: keyof InputStructure): void {
    const value = this.dataInput[field]
    this.errors[field] = ''
    const result = schema.shape[field].safeParse(value)
    if (!result.success) {
      console.log(result.error.errors[0])
      this.errors[field] = result.error.errors[0].message
    }
  },
  async validateDataInput(): Promise<void> {
    Object.keys(this.errors).forEach((key) => {
      const field = key as keyof InputStructure
      this.errors[field] = ''
    })

    const result = schema.safeParse(this.dataInput)

    this.validated = result.success

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof InputStructure
        this.errors[field] = err.message
      })
    }
    if (this.validated) {
      await this.createProject()
    }
  },
  openCloseConfirmation(): void {
    this.confirmationModal = !this.confirmationModal
  },
  async createProject(): Promise<void> {
    this.isLoading = true
    project_data.initialize()
    if (project_data.data && project_data.isInitialized) {
      project_data.data.name = inputField.dataInput.name
      project_data.data.account = inputField.dataInput.account
      project_data.data.uid = user_auth.data ? user_auth.data.uid : ''
      project_data.data.platform = 'META'
    }
    const update = await project_data.createUpdate('new')
    if (update.status) {
      project_data.set(update.data)
      toast({
        title: 'New Project Created',
        description: 'You have succssfully created a new project!',
        variant: 'success',
      })
      router.push({
        name: 'meta',
        params: {
          pj_id: update.data.pj_id,
        },
      })
      pcd.close()
    } else {
      toast({
        title: 'New Project Creation Error',
        description: update.error,
        variant: 'destructive',
      })
    }

    inputStructure = { ...this.dataInput }
    this.isLoading = false
  },
})

onMounted(() => {
  componentLoad.value = true
  inputField.initializeValue()
  componentLoad.value = false
})
</script>
<template>
  <DialogHeader class="pb-4">
    <DialogTitle class="text-xl font-bold">Create a Project with Meta</DialogTitle>
    <DialogDescription> These are the services we offer for Meta </DialogDescription>
  </DialogHeader>
  <!-- Should be component -->
  <div v-if="!componentLoad">
    <div v-if="pcd.activePage === 'services'">
      <div class="max-h-[40vh] overflow-y-auto">
        <div
          v-for="[key, service] in pcd.active_platform?.services"
          :key="key"
          class="group grid grid-cols-[var(--icon-size),1fr] gap-x-4 rounded-md p-2 text-sm/6 transition-all [--icon-size:2rem] hover:bg-gray-200"
        >
          <div
            class="flex size-8 items-center justify-center self-center rounded-full bg-black text-white"
          >
            <i :class="['bx text-xl', service.icon]" />
          </div>
          <div class="flex flex-col gap-y-0">
            <span class="font-semibold">{{ service.label }}</span>
            <span class="text text-xs font-medium text-gray-700">{{ service.description }}</span>
          </div>
        </div>
      </div>
      <DialogFooter class="pt-4">
        <div class="flex items-center justify-end gap-2">
          <Button variant="outline" @click="pcd.returnToPlaforms()"> Back </Button>
          <Button variant="outline" @click="pcd.choosePage()"> Proceed </Button>
        </div>
      </DialogFooter>
    </div>

    <div v-if="pcd.activePage === 'chooseAPage'">
      <div>
        <div class="grid gap-5">
          <div class="flex flex-col gap-y-2 px-2">
            <span class="text-sm font-semibold">Chosen Platform:</span>
            <Input
              v-model="inputField.dataInput.platform"
              @blur="inputField.validateSingleField('platform')"
              type="text"
              placeholder="Project platform"
              class="h-7 text-xs"
              disabled
            />
            <div
              v-if="inputField.errors.platform"
              for="platform"
              class="flex items-center gap-1 text-xs text-red-500"
            >
              <i class="material-icons text-sm">error</i>
              {{ inputField.errors.platform }}
            </div>
          </div>
          <div class="flex flex-col gap-y-2 px-2">
            <span class="text-sm font-semibold">Name of this Automation/Project</span>
            <Input
              v-model="inputField.dataInput.name"
              @blur="inputField.validateSingleField('name')"
              type="text"
              placeholder="Project Name"
              class="h-7 text-xs"
            />
            <div
              v-if="inputField.errors.name"
              for="name"
              class="flex items-center gap-1 text-xs text-red-500"
            >
              <i class="material-icons text-sm">error</i>
              {{ inputField.errors.name }}
            </div>
          </div>
          <div class="flex flex-col gap-y-2 px-2">
            <div class="grid gap-1">
              <span class="text-sm font-semibold">Select a Page you will use</span>
              <span class="text-xs"
                >Can’t see your pages?
                <a href="#" class="text-blue-500 hover:text-blue-700">Click here</a> to import your
                pages first</span
              >
            </div>
            <Combobox model="page" :options="sampleOptions" @select="console.log($event)" />
            <!-- <Input
              v-model="inputField.dataInput.account"
              @blur="inputField.validateSingleField('account')"
              type="text"
              placeholder="Page name"
              class="h-7 text-xs"
            /> -->
            <div
              v-if="inputField.errors.account"
              for="page_id"
              class="flex items-center gap-1 text-xs text-red-500"
            >
              <i class="material-icons text-sm">error</i>
              {{ inputField.errors.account }}
            </div>
          </div>
        </div>
      </div>
      <DialogFooter class="pt-4">
        <div v-if="!inputField.isLoading" class="flex items-center justify-end gap-2">
          <Button variant="outline" @click="pcd.returnToPlaforms()" size="xs"> Back </Button>
          <Button variant="outline" size="xs" @click="inputField.validateDataInput()"
            >Create
          </Button>
        </div>
        <div v-else class="flex items-center justify-end gap-2">
          <Button variant="outline" size="xs" disabled class="flex items-center gap-2">
            <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
          </Button>
        </div>
      </DialogFooter>
    </div>
  </div>
  <div v-else>
    <div class="flex flex-col gap-y-4">
      <div class="flex flex-col gap-y-4">
        <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
        <div class="flex items-center gap-2">
          <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
        </div>
      </div>
      <div class="flex flex-col gap-y-4">
        <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
        <div class="flex items-center gap-2">
          <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
        </div>
      </div>
      <div class="flex flex-col gap-y-4">
        <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
        <div class="flex items-center gap-2">
          <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  </div>
</template>
