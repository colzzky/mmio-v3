<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Input } from '@/core/components/ui/input'
import { Checkbox } from '@/core/components/ui/checkbox'
import { useRouter } from 'vue-router'
import { reactive } from 'vue'
import { Icon } from '@iconify/vue'

const router = useRouter()

// LOGIN USER
const form = reactive({
  email: 'superadmin@mmio.com',
  password: 'password',
})

async function handleLoginUser() {
  // todo: implement authentication

  router.push('/services')
}
</script>

<template>
  <main class="flex min-h-svh flex-1">
    <div
      class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <img class="h-10 w-auto" src="@/assets/logo.png" alt="marketingmaster.io logo" />
          <h2 class="mt-8 text-2xl/9 font-bold tracking-tight">Sign in to your account</h2>
          <p class="mt-2 text-sm/6 text-foreground/50">
            Not a member?
            <Button variant="link" as-child class="h-[unset] p-0">
              <RouterLink to="/register">Create an account</RouterLink>
            </Button>
          </p>
        </div>

        <div class="mt-10">
          <div>
            <form class="space-y-6" @submit.prevent="handleLoginUser">
              <div class="space-y-2">
                <Label for="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  v-model="form.email"
                />
              </div>

              <div class="space-y-2">
                <Label for="password" class="block text-sm/6 font-medium text-gray-900">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="form.password"
                />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Checkbox id="remember-me" name="remember-me" />
                  <Label for="remember-me">Remember me</Label>
                </div>

                <Button variant="link" as-child class="h-[unset] p-0">
                  <RouterLink to="#">Forgot password?</RouterLink>
                </Button>
              </div>

              <div>
                <Button class="w-full">Sign in</Button>
              </div>
            </form>
          </div>

          <div class="mt-10">
            <div class="relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-200" />
              </div>
              <div class="relative flex justify-center text-sm/6 font-medium">
                <span class="bg-white px-6">Or continue with</span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-4">
              <Button class="flex items-center gap-2 text-sm/6 font-semibold" variant="outline">
                <Icon icon="bi:google" class="size-5" />
                Google
              </Button>
              <Button class="flex items-center gap-2 text-sm/6 font-semibold" variant="outline">
                <Icon icon="bi:github" class="size-5" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <img
        class="absolute inset-0 h-full w-full object-cover"
        src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
        alt=""
      />
    </div>
  </main>
</template>
