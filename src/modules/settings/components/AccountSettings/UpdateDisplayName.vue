<script setup lang="ts">
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
import { useAuthStore } from '@/stores/authStore'
import { updateProfile } from 'firebase/auth'
import { onMounted, reactive, ref } from 'vue'
import { z } from 'zod'

const { toast } = useToast()
const useAuth = useAuthStore()
const { user_auth } = useAuth
const componentLoad = ref<boolean>(true)

interface InputStructure {
  displayName: string
}
interface InputField {
  dataInput: InputStructure
  errors: InputStructure
  validated: boolean
  isLoading: boolean
  confirmationModal: boolean
  initializeValue: () => void
  openCloseConfirmation: () => void
  updateDisplayName: () => Promise<void>
  validateDataInput: () => Promise<void>
  validateSingleField: (field: keyof InputStructure) => void
}
//type DefaultInputField = Pick<InputField, 'dataInput'>;
// type DefaultInputField = {
//   dataInput: Partial<InputStructure>
// }

const schema = z.object({
  displayName: z.string().min(1, { message: 'Display name is required' }),
})
//Set default using shallow copy instead of referencing the reactive value
//defaultInputField.dataInput = { ...this.dataInput };

//Default Value
let inputStructure: InputStructure = {
  displayName: '',
}

const inputField = reactive<InputField>({
  dataInput: { ...inputStructure },
  errors: { ...inputStructure },
  validated: false,
  isLoading: false,
  confirmationModal: false,
  initializeValue(): void {
    //Get initial value
    if (user_auth.data && user_auth.data.displayName) {
      inputField.dataInput.displayName = user_auth.data.displayName
    } else {
      inputField.dataInput.displayName = ''
    }
    //get the default
    inputStructure = { ...this.dataInput }
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

    // Set the validation result
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
  async updateDisplayName(): Promise<void> {
    this.isLoading = true
    if (user_auth.data) {
      await updateProfile(user_auth.data, { displayName: this.dataInput.displayName })
      toast({
        title: 'Display Name Updated',
        description: 'You have succssfully updated your display name',
        variant: 'success',
      })
      inputStructure = { ...this.dataInput }
    } else {
      toast({
        title: 'Display Name update error',
        description: 'Something went wrong please try again',
        variant: 'destructive',
      })
      //Option to return to default value when needed.
    }
    this.isLoading = false
    this.openCloseConfirmation()
  },
})

onMounted(() => {
  componentLoad.value = true
  inputField.initializeValue()
  componentLoad.value = false
})
</script>

<template>
  <Toaster />
  <div v-if="!componentLoad" class="flex flex-col gap-y-2">
    <Label for="name" class="text-xs">Display Name</Label>
    <div class="flex items-center gap-2">
      <Input
        v-model="inputField.dataInput.displayName"
        type="text"
        name="name"
        id="name"
        placeholder="John Doe"
        class="h-7 text-xs"
        @blur="inputField.validateSingleField('displayName')"
      />
      <Button size="xs" class="text-xs" @click="inputField.validateDataInput()">Update</Button>
    </div>
    <div
      v-if="inputField.errors.displayName"
      for="name"
      class="flex items-center gap-1 text-xs text-red-500"
    >
      <i class="material-icons text-sm">error</i>
      {{ inputField.errors.displayName }}
    </div>
  </div>

  <div v-else class="flex flex-col gap-y-2">
    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
    <div class="flex items-center gap-2">
      <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
    </div>
    <Skeleton class="h-3 w-[300px] bg-gray-300" />
  </div>

  <!-- Modal For Confirming Display name  -->
  <Dialog v-model:open="inputField.confirmationModal">
    <DialogContent @interact-outside="(e) => e.preventDefault()">
      <div class="relative">
        <button
          @click="inputField.openCloseConfirmation()"
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
              <Button variant="outline" size="xs" @click="inputField.updateDisplayName()">
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
