<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import DialogDescription from '@/core/components/ui/dialog/DialogDescription.vue'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Skeleton } from '@/core/components/ui/skeleton'
import { useToast, Toaster } from '@/core/components/ui/toast'
import { auth } from '@/core/utils/firebase-client'
import { useAuthStore } from '@/stores/authStore'
import { reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { EmailAuthProvider } from 'firebase/auth/web-extension'
import { onMounted, reactive, ref } from 'vue'
import { z } from 'zod'

const { toast } = useToast()
const useAuth = useAuthStore()
const { user_auth } = useAuth
const componentLoad = ref<boolean>(true)

interface InputStructure {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
interface ChangePasswordField {
  dataInput: InputStructure
  errors: InputStructure
  validated: boolean
  isLoading: boolean
  changePasswordModal: boolean
  initializeValue: () => void
  openCloseModal: () => void
  setDefault: () => void
  changePasswordFirebase: () => Promise<void>
  validateSubmit: () => Promise<void>
  validateSingleField: (field: keyof InputStructure) => void
}

//Default value both for errors and inputField
let inputStructure = reactive<InputStructure>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

//Schema structure for validation
const schema = z.object({
  oldPassword: z.string().min(1, { message: 'Old password is required' }),
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters long' }),
  confirmPassword: z.string().min(8, { message: 'Please confirm your password' }),
})

const changePasswordField = reactive<ChangePasswordField>({
  //Set default using shallow copy instead of referencing the reactive value
  dataInput: { ...inputStructure },
  errors: { ...inputStructure },
  validated: false,
  isLoading: false,
  changePasswordModal: false,
  initializeValue(): void {
    //Nothing to initialize
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
  async validateSubmit(): Promise<void> {
    this.isLoading = true
    Object.keys(this.errors).forEach((key) => {
      const field = key as keyof InputStructure
      this.errors[field] = ''
    })

    const result = schema.safeParse(this.dataInput)
    const validateWithPasswordConfirmation = (dataInput: InputStructure) => {
      const passwordConfirmation = schema.refine(
        (data) => data.newPassword === data.confirmPassword,
        {
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        },
      )
      return passwordConfirmation.safeParse(dataInput)
    }
    const passwordConfirmation = validateWithPasswordConfirmation(this.dataInput)
    // Set the validation result

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof InputStructure
        this.errors[field] = err.message
      })
    }

    if (!passwordConfirmation.success && result.error) {
      ;(this.errors.confirmPassword = 'Validation failed:'), result.error.errors
    }

    this.validated = result.success && passwordConfirmation.success

    if (this.validated) {
      await this.changePasswordFirebase()
      this.openCloseModal()
    }
    this.isLoading = false
  },
  openCloseModal(): void {
    if (this.changePasswordModal) {
      this.setDefault()
    }
    this.changePasswordModal = !this.changePasswordModal
  },
  async changePasswordFirebase(): Promise<void> {
    user_auth.checkUser()
    if (user_auth.data) {
      let errorMsg
      const userEmail = user_auth.data.email ? user_auth.data.email : ''
      const credential = EmailAuthProvider.credential(userEmail, this.dataInput.oldPassword)
      const reauthenticate = await reauthenticateWithCredential(user_auth.data, credential)
        .then(async () => {
          const newPassword = this.dataInput.newPassword
          if (auth.currentUser && auth.currentUser.emailVerified) {
            const update = await updatePassword(auth.currentUser, newPassword)
              .then(() => {
                return true
              })
              .catch((error) => {
                errorMsg = error
                return false
              })
            return update
          } else {
            return false
          }
        })
        .catch((error) => {
          errorMsg = error
          return false
        })
      if (reauthenticate) {
        toast({
          title: 'Password Updated',
          description: 'You have successfully changed your password',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Change Password Error',
          description: 'Error: ' + errorMsg + ' - Something went wrong please try again',
          variant: 'destructive',
        })
      }
    } else {
      toast({
        title: 'Change Password Error',
        description: 'It seems that this user does not exist please login and try again.',
        variant: 'destructive',
      })
    }
  },
  setDefault() {
    this.dataInput = { ...inputStructure }
    this.errors = { ...inputStructure }
  },
})

//Initialization call in here when your fetching something before showing it. Do not call in here something that's already called in page
onMounted(() => {
  componentLoad.value = true
  changePasswordField.initializeValue()
  componentLoad.value = false
})
</script>

<template>
  <Toaster />
  <div v-if="!componentLoad">
    <div class="flex flex-col gap-y-2">
      <Label for="password">Password</Label>
      <!-- <Input type="password" name="password" id="password" placeholder="johndoe@gmail.com" /> -->
      <div class="flex items-center justify-between text-sm">
        <span class="font-medium">********</span>
        <Button
          variant="link"
          class="h-[unset] p-0 text-blue-500"
          @click="changePasswordField.openCloseModal()"
          >Change Password</Button
        >
      </div>
    </div>

    <Dialog v-model:open="changePasswordField.changePasswordModal">
      <DialogContent @interact-outside="(e) => e.preventDefault()">
        <div class="relative">
          <button
            :disabled="changePasswordField.isLoading"
            @click="changePasswordField.openCloseModal()"
            class="absolute right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <i class="material-icons">close</i>
          </button>
        </div>
        <div>
          <DialogHeader class="pb-4">
            <DialogTitle class="text-xl font-bold">Change Password?</DialogTitle>
            <DialogDescription class="">Please fill out the required fields</DialogDescription>
          </DialogHeader>
          <div class="flex flex-col gap-y-3">
            <div class="flex flex-col gap-y-2">
              <Label for="oldPassword" class="text-xs">Old Password</Label>
              <div class="flex items-center gap-2">
                <Input
                  :disabled="changePasswordField.isLoading"
                  v-model="changePasswordField.dataInput.oldPassword"
                  type="password"
                  name="oldPassword"
                  id="oldPassword"
                  placeholder="password"
                  class="h-7 text-xs"
                  @blur="changePasswordField.validateSingleField('oldPassword')"
                />
              </div>
              <div
                v-if="changePasswordField.errors.oldPassword"
                for="name"
                class="flex items-center gap-1 text-xs text-red-500"
              >
                <i class="material-icons text-sm">error</i>
                {{ changePasswordField.errors.oldPassword }}
              </div>
            </div>

            <div class="flex flex-col gap-y-2">
              <Label for="newPassword" class="text-xs">New Password</Label>
              <div class="flex items-center gap-2">
                <Input
                  :disabled="changePasswordField.isLoading"
                  v-model="changePasswordField.dataInput.newPassword"
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  placeholder="password"
                  class="h-7 text-xs"
                  @blur="changePasswordField.validateSingleField('newPassword')"
                />
              </div>
              <div
                v-if="changePasswordField.errors.newPassword"
                for="name"
                class="flex items-center gap-1 text-xs text-red-500"
              >
                <i class="material-icons text-sm">error</i>
                {{ changePasswordField.errors.newPassword }}
              </div>
            </div>

            <div class="flex flex-col gap-y-2">
              <Label for="confirmPassword" class="text-xs">Confirm Password</Label>
              <div class="flex items-center gap-2">
                <Input
                  :disabled="changePasswordField.isLoading"
                  v-model="changePasswordField.dataInput.confirmPassword"
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="password"
                  class="h-7 text-xs"
                  @blur="changePasswordField.validateSingleField('confirmPassword')"
                />
              </div>
              <div
                v-if="changePasswordField.errors.confirmPassword"
                for="name"
                class="flex items-center gap-1 text-xs text-red-500"
              >
                <i class="material-icons text-sm">error</i>
                {{ changePasswordField.errors.confirmPassword }}
              </div>
            </div>
          </div>

          <DialogFooter class="pt-4">
            <div>
              <div
                v-if="!changePasswordField.isLoading"
                class="flex items-center justify-end gap-2"
              >
                <Button variant="outline" size="xs" @click="changePasswordField.openCloseModal()">
                  Cancel
                </Button>
                <Button variant="outline" size="xs" @click="changePasswordField.validateSubmit()">
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
  </div>

  <div v-else>
    <div class="flex flex-col gap-y-2">
      <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
      <div class="flex items-center gap-2">
        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
      </div>
      <Skeleton class="h-3 w-[300px] bg-gray-300" />
    </div>
  </div>
</template>
