<script lang="ts" setup>
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Skeleton } from '@/core/components/ui/skeleton'
import { useToast, Toaster } from '@/core/components/ui/toast'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { postCollection } from '@/core/utils/firebase-collections'
import { useAuthStore } from '@/stores/authStore'
import { computed, onMounted, reactive, ref } from 'vue'
import { z } from 'zod'

const { toast } = useToast()
const useAuth = useAuthStore()
const { user } = useAuth
//Requirement when setting up Component
const componentLoad = ref<boolean>(true)
//Requirement when data is still fetching

interface InputStructure {
  firstName: string
  lastName: string
  contactEmail: string
}
interface InputField {
  dataInput: InputStructure
  errors: InputStructure
  validated: boolean
  isLoading: boolean
  confirmationModal: boolean
  initializeValue: () => void
  openCloseConfirmation: () => void
  updateBasicInfo: () => Promise<void>
  validateDataInput: () => Promise<void>
  validateSingleField: (field: keyof InputStructure) => void
}

const schema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  contactEmail: z.string().email({ message: 'Invalid email address' }),
})

//initial input
let inputStructure: InputStructure = {
  firstName: '',
  lastName: '',
  contactEmail: '',
}

const inputField = reactive<InputField>({
  dataInput: { ...inputStructure },
  errors: { ...inputStructure },
  validated: false,
  isLoading: false,
  confirmationModal: false,
  initializeValue(): void {
    if (user.data) {
      inputField.dataInput.firstName = user.data.profile.firstName ?? ''
      inputField.dataInput.lastName = user.data.profile.lastName ?? ''
      inputField.dataInput.contactEmail = user.data.profile.contactEmail ?? ''
    }
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
      this.openCloseConfirmation()
    }
  },
  openCloseConfirmation(): void {
    this.confirmationModal = !this.confirmationModal
  },
  async updateBasicInfo(): Promise<void> {
    this.isLoading = true
    if (user.data) {
      user.data = {
        ...user.data,
        profile: {
          ...user.data.profile,
          firstName: this.dataInput.firstName,
          lastName: this.dataInput.lastName,
          contactEmail: this.dataInput.contactEmail,
        },
      }
      const update = await postCollection(DbCollections.users, {
        data: user.data,
        idKey:'uid'
      })

      if (update.status) {
        toast({
          title: 'Basic Information Update Successful',
          description: 'You have succssfully updated your display name',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Basic Information Update Error',
          description: update.error,
          variant: 'destructive',
        })
      }
    }
    inputStructure = { ...this.dataInput }
    this.isLoading = false
    this.openCloseConfirmation()
  },
})

//Things to be preloaded
onMounted(() => {
  componentLoad.value = true
  componentLoad.value = false
})
const componentDataLoaded = computed<boolean>(() => {
  if (user.isInitialized) {
    inputField.initializeValue()
  }
  return user.isInitialized
})
</script>
<template>
  <Toaster />
  <div v-if="componentDataLoaded && !componentLoad" class="flex flex-col gap-y-4">
    <div class="flex flex-col gap-y-4">
      <h2 class="text-sm font-bold">Basic Information</h2>
      <div class="flex flex-col gap-y-2">
        <Label for="lastName" class="text-xs">Last Name</Label>
        <Input
          v-model="inputField.dataInput.lastName"
          @blur="inputField.validateSingleField('lastName')"
          type="text"
          name="lastName"
          id="lastName"
          placeholder="Doe"
          class="h-7 text-xs"
        />
        <div
          v-if="inputField.errors.lastName"
          for="name"
          class="flex items-center gap-1 text-xs text-red-500"
        >
          <i class="material-icons text-sm">error</i>
          {{ inputField.errors.lastName }}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-y-4">
      <div class="flex flex-col gap-y-2">
        <Label for="firstName" class="text-xs">First Name</Label>
        <Input
          v-model="inputField.dataInput.firstName"
          @blur="inputField.validateSingleField('firstName')"
          type="text"
          name="firstName"
          id="firstName"
          placeholder="John"
          class="h-7 text-xs"
        />
        <div
          v-if="inputField.errors.firstName"
          for="name"
          class="flex items-center gap-1 text-xs text-red-500"
        >
          <i class="material-icons text-sm">error</i>
          {{ inputField.errors.firstName }}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-y-4">
      <div class="flex flex-col gap-y-2">
        <Label for="contactEmail" class="text-xs">Contact Email:</Label>
        <Input
          v-model="inputField.dataInput.contactEmail"
          @blur="inputField.validateSingleField('contactEmail')"
          type="email"
          name="contactEmail"
          id="contactEmail"
          placeholder="johndoe@work.com"
          class="h-7 text-xs"
        />
        <div
          v-if="inputField.errors.contactEmail"
          for="name"
          class="flex items-center gap-1 text-xs text-red-500"
        >
          <i class="material-icons text-sm">error</i>
          {{ inputField.errors.contactEmail }}
        </div>
      </div>
    </div>
    <Button class="self-end text-xs" size="xs" @click="inputField.validateDataInput()"
      >Update</Button
    >
  </div>
  <div v-else class="flex flex-col gap-y-4">
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

  <!-- Modal For Confirming Display name  -->
  <Dialog v-model:open="inputField.confirmationModal">
    <DialogContent @interact-outside="(e) => e.preventDefault()">
      <div class="relative">
        <button
          @click="inputField.openCloseConfirmation()"
          :disabled="inputField.isLoading"
          class="absolute right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <i class="material-icons">close</i>
        </button>
      </div>
      <div>
        <DialogHeader class="pb-4">
          <DialogTitle class="text-xl font-bold">Confirm Changes?</DialogTitle>
        </DialogHeader>
        <span class="text-sm"
          >You're about to update your profile. Are you sure about this changes?</span
        >
        <DialogFooter class="pt-4">
          <div>
            <div v-if="!inputField.isLoading" class="flex items-center justify-end gap-2">
              <Button variant="outline" size="xs" @click="inputField.openCloseConfirmation()">
                Cancel
              </Button>
              <Button variant="outline" size="xs" @click="inputField.updateBasicInfo()">
                Confirm
              </Button>
            </div>
            <div v-else class="flex items-center justify-end gap-2">
              <Button variant="outline" size="xs" disabled class="flex items-center gap-2">
                <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
              </Button>
            </div>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
