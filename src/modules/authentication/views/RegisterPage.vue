<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Checkbox } from '@/core/components/ui/checkbox'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Toaster } from '@/core/components/ui/toast'
import { useToast } from '@/core/components/ui/toast/use-toast'
import { auth } from '@/core/utils/firebase-client'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  setPersistence,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { reactive, ref, watch } from 'vue'
import { z } from 'zod'

const authStore = useAuthStore()
const { user_auth, createNewUserProfile, after_auth_initialization } = authStore
const { toast } = useToast()

// REGISTER USER

interface InputStructure {
  email: string
  name: string
  password: string
}
interface RegistrationField {
  dataInput: InputStructure
  agreeToTermsAndCondition: boolean
  errors: InputStructure
  validated: boolean
  isLoading: boolean
  changePasswordModal: boolean
  initializeValue: () => void
  setDefault: () => void
  registerFirebase: () => Promise<void>
  registerFacebook: () => Promise<void>
  validateSubmit: (type: 'register' | 'meta' | 'google') => Promise<void>
  validateSingleField: (field: keyof InputStructure) => void
}

//Default value both for errors and inputField
let inputStructure = reactive<InputStructure>({
  email: '',
  name: '',
  password: '',
})

//Schema structure for validation
const schema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),
  name: z.string().min(8, { message: 'Name must be at least 8 characters long' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
})

const registrationField = reactive<RegistrationField>({
  //Set default using shallow copy instead of referencing the reactive value
  dataInput: { ...inputStructure },
  errors: { ...inputStructure },
  agreeToTermsAndCondition: false,
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
  async validateSubmit(type): Promise<void> {
    if (this.agreeToTermsAndCondition) {
      const typeActions: { [key in typeof type]: () => void } = {
        register: async () => {
          this.isLoading = true
          Object.keys(this.errors).forEach((key) => {
            const field = key as keyof InputStructure
            this.errors[field] = ''
          })

          const result = schema.safeParse(this.dataInput)

          if (!result.success) {
            result.error.errors.forEach((err) => {
              const field = err.path[0] as keyof InputStructure
              this.errors[field] = err.message
            })
          }

          this.validated = result.success

          if (this.validated) {
            await this.registerFirebase()
          }
          this.isLoading = false
        },
        google: () => {},
        meta: async () => {
          this.isLoading = true
          await this.registerFacebook()
          this.isLoading = false
        },
      }

      typeActions[type]?.()
    } else {
      toast({
        title: 'Registration error',
        description: 'You must first agree with our terms and conditions',
        variant: 'destructive',
      })
    }
  },
  async registerFirebase(): Promise<void> {
    await setPersistence(auth, browserLocalPersistence).then(async () => {
      await createUserWithEmailAndPassword(auth, this.dataInput.email, this.dataInput.password)
        .then(async () => {
          if (auth.currentUser) {
            //Add to collection
            console.log(auth.currentUser)
            await updateProfile(auth.currentUser, { displayName: this.dataInput.name })
            user_auth.setUser(auth.currentUser)
            await createNewUserProfile({
              displayName: auth.currentUser.displayName,
              email: auth.currentUser.email,
              emailVerified: auth.currentUser.emailVerified,
              photoURL: auth.currentUser.photoURL,
              uid: auth.currentUser.uid,
            })
            router.push({ name: 'home' })
          }
        })
        .catch((error) => {
          toast({
            title: 'Registration error',
            description: error,
            variant: 'destructive',
          })
        })
    })
  },
  async registerFacebook(): Promise<void> {
    const provider = new FacebookAuthProvider()
    await signInWithPopup(auth, provider)
      .then(async (result) => {
        user_auth.setUser(result.user)
        await createNewUserProfile({
          displayName: result.user.displayName,
          email: result.user.email,
          emailVerified: result.user.emailVerified,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
        })
        router.replace({ name: 'home' })
      })
      .catch((error) => {
        toast({
          title: 'Registration error',
          description: error,
          variant: 'destructive',
        })
      })
  },
  setDefault() {
    this.dataInput = { ...inputStructure }
    this.errors = { ...inputStructure }
  },
})
const pageLoad = ref<boolean>(true)
watch(
  () => authStore.page_init.initialize,
  async (newVal) => {
    console.log('hello');
    if (newVal) {
      pageLoad.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <main v-if="!pageLoad"
    class="mx-auto grid min-h-svh w-[calc(100svw-calc(var(--gutter)*2))] max-w-screen-xl grid-rows-[48px_1fr] gap-8 py-[var(--gutter)] [--gutter:1rem] lg:grid-cols-5 lg:[--gutter:2rem]"
  >
    <img
      class="h-12 w-auto self-start lg:col-span-5"
      src="@/assets/logo.png"
      alt="marketingmaster.io logo"
    />
    <div
      class="flex flex-col gap-y-8 lg:col-span-2 lg:self-center"
      :class="{ 'cursor-not-allowed': registrationField.isLoading }"
    >
      <section class="flex flex-col gap-y-2">
        <h1 class="text-4xl/none font-bold">Set your Username, Email and Password</h1>
        <p class="text-sm">
          Already have an account?
          <Button variant="link" as-child class="h-[unset] p-0 text-blue-500">
            <RouterLink to="/login">Email, Facebook, and Google</RouterLink>
          </Button>
        </p>
      </section>
      <div class="flex flex-col gap-y-4">
        <div class="flex flex-col gap-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            v-model="registrationField.dataInput.email"
            placeholder="johndoe@gmail.com"
          />
          <div
            v-if="registrationField.errors.email"
            for="name"
            class="flex items-center gap-1 text-xs text-red-500"
          >
            <i class="material-icons text-sm">error</i>
            {{ registrationField.errors.email }}
          </div>
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="name">Display Name:</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autocomplete="name"
            placeholder="John Doe"
            v-model="registrationField.dataInput.name"
          />
          <div
            v-if="registrationField.errors.name"
            for="name"
            class="flex items-center gap-1 text-xs text-red-500"
          >
            <i class="material-icons text-sm">error</i>
            {{ registrationField.errors.name }}
          </div>
        </div>

        <div class="flex flex-col gap-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autocomplete="password"
            placeholder="********"
            v-model="registrationField.dataInput.password"
          />
          <div
            v-if="registrationField.errors.password"
            for="name"
            class="flex items-center gap-1 text-xs text-red-500"
          >
            <i class="material-icons text-sm">error</i>
            {{ registrationField.errors.password }}
          </div>
        </div>

        <div class="flex items-center">
          <Checkbox
            id="termsAndCondition"
            name="termsAndCondition"
            v-model:checked="registrationField.agreeToTermsAndCondition"
          />
          <Label for="termsAndCondition">
            I agree to
            <Button variant="link" as-child class="h-[unset] p-0 text-blue-500">
              <RouterLink to="#">Terms and Condition</RouterLink>
            </Button>
          </Label>
        </div>
        <div v-if="!registrationField.isLoading" class="flex items-center justify-end gap-x-3">
          <Button
            type="submit"
            @click="registrationField.validateSubmit('google')"
            size="sm"
            class="text-xs"
            variant="outline"
          >
            <i class="bx bxl-google pr-2 text-2xl"></i>Register with Google</Button
          >
          <Button
            type="submit"
            @click="registrationField.validateSubmit('meta')"
            size="sm"
            class="text-xs"
            variant="outline"
          >
            <i class="bx bxl-meta pr-2 text-2xl"></i>
            Register with Meta</Button
          >
          <Button
            type="submit"
            @click="registrationField.validateSubmit('register')"
            size="sm"
            class="text-xs"
            >Create Account</Button
          >
        </div>
        <div v-else class="flex items-center justify-end gap-x-3">
          <Button variant="outline" size="xs" disabled class="flex items-center gap-2">
            <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
          </Button>
        </div>
      </div>
    </div>
    <div class="col-span-3 hidden place-content-center lg:grid">
      <img src="@/assets/login.png" alt="" />
    </div>
  </main>
  <div v-else class="flex h-screen flex-col items-center justify-center bg-gray-100">
    <div class="flex animate-pulse items-center gap-x-1">
      <i class="material-icons text-4xl">pin</i>
      <span class="text-xl font-extrabold">MMIO</span>
    </div>
    <div class="flex items-center justify-center space-x-2">
      <i class="material-icons animate-spin text-sm">donut_large</i>
      <div>Loading</div>
    </div>
  </div>
  <Toaster />
</template>
