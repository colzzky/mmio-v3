<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { useToast } from '@/core/components/ui/toast'
import { auth } from '@/core/utils/firebase-client'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { Icon } from '@iconify/vue'
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth'
import { reactive, ref } from 'vue'
const authStore = useAuthStore()
const { user_auth } = authStore
const { toast } = useToast()

// USER SIGNIN WITH EMAIL AND PASSWORD
const isSignInCredentialsFormVisible = ref(false)
function toggleSignInCredentialsForm() {
  isSignInCredentialsFormVisible.value = !isSignInCredentialsFormVisible.value
}

const form = reactive({
  email: 'superadmin@mmio.com',
  password: 'password',
})
async function handleLoginUser(){
  // todo: implement authentication
  await loginUser(form.email, form.password)
}

const loginUser = async (email: string, password: string): Promise<void> => {
  await setPersistence(auth, browserLocalPersistence).then(async () => {
    await signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        if (auth.currentUser) {
          user_auth.setUser(auth.currentUser)
          toast({
            title: 'MMIO v3 Registration',
            description: 'You have successfully Logged in.',
            variant: "success"
          })
          router.push({name:"home"})
        }
      })
      .catch((error) => {
        toast({
          title: 'Registration error',
          description: error,
          variant: "destructive"
        })
      })
  })
}


</script>

<template>
  <main
    class="mx-auto flex w-[calc(100svw-calc(var(--gutter)*2))] max-w-screen-xl flex-col gap-y-8 py-[var(--gutter)] [--gutter:1rem] lg:[--gutter:2rem]">
    <img class="h-12 w-auto self-start" src="@/assets/logo.png" alt="marketingmaster.io logo" />
    <template v-if="!isSignInCredentialsFormVisible">
      <section class="flex flex-col gap-y-2 text-center">
        <h1 class="text-4xl/none font-bold">Sign in to MMIO</h1>
        <p class="text-sm">
          New to MMIO?
          <Button variant="link" as-child class="h-[unset] p-0 text-blue-500">
            <RouterLink to="/register">Create an account</RouterLink>
          </Button>
        </p>
      </section>
      <section class="flex w-[calc(100svw-2rem)] max-w-xs flex-col gap-y-2 self-center">
        <Button variant="secondary" class="relative" @click="toggleSignInCredentialsForm">
          <Icon icon="ic:baseline-email" class="absolute left-4 top-1/2 size-5 -translate-y-1/2" />
          Email
        </Button>
        <Button variant="secondary" class="relative">
          <Icon icon="bi:google" class="absolute left-4 top-1/2 size-5 -translate-y-1/2" />
          Sign in with Google
        </Button>
        <Button variant="secondary" class="relative">
          <Icon icon="bi:facebook" class="absolute left-4 top-1/2 size-5 -translate-y-1/2" />
          Sign in with Facebook
        </Button>
      </section>
    </template>
    <template v-else>
      <section class="flex flex-col gap-y-2 text-center">
        <h1 class="text-4xl/none font-bold">Login with your Email</h1>
        <p class="text-sm">
          You can also use
          <Button variant="link" class="h-[unset] p-0 text-blue-500" @click="toggleSignInCredentialsForm">
            Facebook or Google
          </Button>
          to login
        </p>
      </section>
      <form class="flex w-[calc(100svw-2rem)] max-w-lg flex-col gap-y-4 self-center" @submit.prevent="handleLoginUser">
        <div class="flex flex-col gap-y-2">
          <Label for="email">Email Address</Label>
          <Input id="email" name="email" type="email" placeholder="johndoe@gmail.com" autocomplete="email" required
            v-model="form.email" />
        </div>
        <div class="grid grid-cols-2 gap-y-1">
          <Label for="password">Password</Label>
          <Button variant="link" as-child class="h-[unset] justify-self-end p-0 text-blue-500">
            <RouterLink to="/forgot-password">Forgot your password?</RouterLink>
          </Button>
          <Input id="password" name="password" type="password" placeholder="********" autocomplete="password"
            class="col-span-2" required v-model="form.password" />
        </div>
        <Button type="submit">Sign in</Button>
      </form>
    </template>
  </main>
</template>
