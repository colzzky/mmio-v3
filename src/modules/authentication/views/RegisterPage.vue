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
  setPersistence,
} from 'firebase/auth'
import { reactive } from 'vue'

const authStore = useAuthStore()
const { user_auth } = authStore
const { toast } = useToast()

// REGISTER USER

const form = reactive({
  email: 'superadmin@mmio.com',
  name: 'Super Admin',
  password: 'password',
  agreeToTermsAndCondition: false,
})

async function handleRegisterUser() {
  // todo: implement authentication
  // Add loading inside button
  if (!form.agreeToTermsAndCondition) {
    throw new Error('You must agree to the terms and conditions')
  }
  await emailRegisterUser(form.email, form.password)
}

const emailRegisterUser = async (email: string, password: string): Promise<void> => {
  await setPersistence(auth, browserLocalPersistence).then(async () => {
    await createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        if (auth.currentUser) {
          //Add to collection
          user_auth.setUser(auth.currentUser)
          toast({
            title: 'MMIO v3 Registration',
            description: 'You have successfully registered. Please sign in.',
            variant: 'success',
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
}
</script>

<template>
  <main
    class="mx-auto grid min-h-svh w-[calc(100svw-calc(var(--gutter)*2))] max-w-screen-xl grid-rows-[48px_1fr] gap-8 py-[var(--gutter)] [--gutter:1rem] lg:grid-cols-5 lg:[--gutter:2rem]"
  >
    <img
      class="h-12 w-auto self-start lg:col-span-5"
      src="@/assets/logo.png"
      alt="marketingmaster.io logo"
    />
    <div class="flex flex-col gap-y-8 lg:col-span-2 lg:self-center">
      <section class="flex flex-col gap-y-2">
        <h1 class="text-4xl/none font-bold">Set your Username, Email and Password</h1>
        <p class="text-sm">
          Already have an account?
          <Button variant="link" as-child class="h-[unset] p-0 text-blue-500">
            <RouterLink to="/login">Email, Facebook, and Google</RouterLink>
          </Button>
        </p>
      </section>
      <form class="flex flex-col gap-y-4" @submit.prevent="handleRegisterUser">
        <div class="flex flex-col gap-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            v-model="form.email"
            placeholder="johndoe@gmail.com"
            required
          />
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="name">Display Name:</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autocomplete="name"
            placeholder="John Doe"
            v-model="form.name"
            required
          />
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autocomplete="password"
            placeholder="********"
            v-model="form.password"
            required
          />
        </div>
        <div class="flex items-center">
          <Checkbox
            id="termsAndCondition"
            name="termsAndCondition"
            v-model:checked="form.agreeToTermsAndCondition"
          />
          <Label for="termsAndCondition">
            I agree to
            <Button variant="link" as-child class="h-[unset] p-0 text-blue-500">
              <RouterLink to="#">Terms and Condition</RouterLink>
            </Button>
          </Label>
        </div>
        <Button type="submit" :disabled="!form.agreeToTermsAndCondition">Create Account</Button>
      </form>
    </div>
    <div class="col-span-3 hidden place-content-center lg:grid">
      <img src="@/assets/login.png" alt="" />
    </div>
  </main>
  <Toaster />
</template>
