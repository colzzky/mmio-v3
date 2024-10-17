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
import { useAuthStore } from '@/stores/authStore'
import { computed, onMounted, reactive, ref } from 'vue'
import { z } from 'zod'

const { toast } = useToast()
const useAuth = useAuthStore()
const { user_profile } = useAuth
//Requirement when setting up Component
const componentLoad = ref<boolean>(true)
//Requirement when data is still fetching

interface InputStructure {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}
interface InputField {
  dataInput: InputStructure
  errors: InputStructure
  validated: boolean
  isLoading: boolean
  confirmationModal: boolean
  initializeValue: () => void
  openCloseConfirmation: () => void
  updateAddress: () => Promise<void>
  validateDataInput: () => Promise<void>
  validateSingleField: (field: keyof InputStructure) => void
}

const schema = z.object({
  street: z.string().min(1, { message: 'Street is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  zipCode: z
    .string()
    .min(1, { message: 'Zip code is required' })
    .regex(/^\d{5}(-\d{4})?$/, { message: 'Invalid zip code' }), // Validates US zip codes
})

//initial input
let inputStructure: InputStructure = {
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
}

const inputField = reactive<InputField>({
  dataInput: { ...inputStructure },
  errors: { ...inputStructure },
  validated: false,
  isLoading: false,
  confirmationModal: false,
  initializeValue(): void {
    if (user_profile.data && user_profile.data.address) {
      inputField.dataInput.street = user_profile.data.address.street ?? ''
      inputField.dataInput.city = user_profile.data.address.city ?? ''
      inputField.dataInput.state = user_profile.data.address.state ?? ''
      inputField.dataInput.country = user_profile.data.address.country ?? ''
      inputField.dataInput.zipCode = user_profile.data.address.zipCode ?? ''
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
  async updateAddress(): Promise<void> {
    this.isLoading = true
    //await updateProfile(user_auth.data, { displayName: this.dataInput.displayName });
    console.log(user_profile.data)
    if (user_profile.data && user_profile.data.address) {
      user_profile.data.address.city = this.dataInput.city
      user_profile.data.address.state = this.dataInput.state
      user_profile.data.address.street = this.dataInput.street
      user_profile.data.address.country = this.dataInput.country
      user_profile.data.address.zipCode = this.dataInput.zipCode
      console.log(this.dataInput)
      const update = await user_profile.update()
      if (update.status) {
        toast({
          title: 'Address Update Successful',
          description: 'You have succssfully updated your Address',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Address Update Error',
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
  if (user_profile.isInitialized) {
    inputField.initializeValue()
  }
  return user_profile.isInitialized
})
</script>
<template>
  <Toaster />
  <div v-if="componentDataLoaded && !componentLoad" class="flex flex-col gap-y-4">
    <h2 class="text-sm font-bold">Address</h2>
    <div class="flex flex-col gap-y-2">
      <Label for="street" class="text-xs">Street</Label>
      <Input
        v-model="inputField.dataInput.street"
        @blur="inputField.validateSingleField('street')"
        type="text"
        name="street"
        id="street"
        placeholder="147 Chance Plain"
        class="h-7 text-xs"
      />
      <div
        v-if="inputField.errors.street"
        for="name"
        class="flex items-center gap-1 text-xs text-red-500"
      >
        <i class="material-icons text-sm">error</i>
        {{ inputField.errors.street }}
      </div>
    </div>

    <div class="flex flex-col gap-y-2">
      <Label for="city" class="text-xs">City</Label>
      <Input
        v-model="inputField.dataInput.city"
        @blur="inputField.validateSingleField('city')"
        type="text"
        name="street"
        id="city"
        placeholder="Delphiaworth"
        class="h-7 text-xs"
      />
      <div
        v-if="inputField.errors.city"
        for="name"
        class="flex items-center gap-1 text-xs text-red-500"
      >
        <i class="material-icons text-sm">error</i>
        {{ inputField.errors.city }}
      </div>
    </div>

    <div class="flex flex-col gap-y-2">
      <Label for="state" class="text-xs">State</Label>
      <Input
        v-model="inputField.dataInput.state"
        @blur="inputField.validateSingleField('state')"
        type="text"
        name="street"
        id="state"
        placeholder="Rhose Island"
        class="h-7 text-xs"
      />
      <div
        v-if="inputField.errors.state"
        for="name"
        class="flex items-center gap-1 text-xs text-red-500"
      >
        <i class="material-icons text-sm">error</i>
        {{ inputField.errors.state }}
      </div>
    </div>

    <div class="flex flex-col gap-y-2">
      <Label for="country" class="text-xs">Country</Label>
      <Input
        v-model="inputField.dataInput.country"
        @blur="inputField.validateSingleField('country')"
        type="text"
        name="street"
        id="country"
        placeholder="United States"
        class="h-7 text-xs"
      />
      <div
        v-if="inputField.errors.country"
        for="name"
        class="flex items-center gap-1 text-xs text-red-500"
      >
        <i class="material-icons text-sm">error</i>
        {{ inputField.errors.country }}
      </div>
    </div>
    <div class="flex flex-col gap-y-2">
      <Label for="zipCode" class="text-xs">Zip Code</Label>
      <Input
        v-model="inputField.dataInput.zipCode"
        @blur="inputField.validateSingleField('zipCode')"
        type="text"
        name="street"
        id="zipCode"
        placeholder="72801-5565"
        class="h-7 text-xs"
      />
      <div
        v-if="inputField.errors.zipCode"
        for="name"
        class="flex items-center gap-1 text-xs text-red-500"
      >
        <i class="material-icons text-sm">error</i>
        {{ inputField.errors.zipCode }}
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
              <Button variant="outline" size="xs" @click="inputField.updateAddress()">
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
