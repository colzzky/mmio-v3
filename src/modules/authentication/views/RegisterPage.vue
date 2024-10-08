<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Checkbox } from '@/core/components/ui/checkbox'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { auth } from '@/core/utils/firebase-client'
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { reactive } from 'vue'

const {
  APP_FIREBASE_APIKEY,
  APP_FIREBASE_AUTHDOMAIN,
  APP_FIREBASE_PROJECTID,
  APP_FIREBASE_STORAGEBUCKET,
  APP_FIREBASE_MESSAGINGSENDERID,
  APP_FIREBASE_APPID,
  APP_FIREBASE_MEASUREMENTID,
} = import.meta.env
console.log(APP_FIREBASE_APIKEY)
// REGISTER USER
const form = reactive({
  email: 'superadmin@mmio.com',
  name: 'Super Admin',
  password: 'password',
  agreeToTermsAndCondition: false,
})

async function handleRegisterUser() {
  // todo: implement authentication
  if (!form.agreeToTermsAndCondition) {
    throw new Error('You must agree to the terms and conditions')
  }
  await emailRegisterUser(form.email, form.password)
  alert(`Email: ${form.email}, Name: ${form.name}, Password: ${form.password}, `)
}

const emailRegisterUser = async (email: string, password: string): Promise<void> => {
  await createUserWithEmailAndPassword(auth, email, password)
    .then((data) => {
      console.log(data)
      console.log(auth.currentUser)
    })
    .catch((error) => {
      console.log(error)
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
</template>
