<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Skeleton } from '@/core/components/ui/skeleton'
import { useToast, Toaster } from '@/core/components/ui/toast'
import { useAuthStore } from '@/stores/authStore'
import { sendEmailVerification } from 'firebase/auth'
import { onMounted, ref } from 'vue'

const { toast } = useToast()
const useAuth = useAuthStore()
const { user_auth } = useAuth
const componentLoad = ref<boolean>(true)
const email_verified = ref<boolean>(false)

async function sendEmailVerificationLink(): Promise<void> {
  if (user_auth.data) {
    try {
      await sendEmailVerification(user_auth.data)
      toast({
        title: 'Email Verification Request',
        description: 'We have successfully sent you an email verification. Please check your email',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Email Verification Error',
        description: error + ": 'Please refresh the page and try again'",
        variant: 'destructive',
      })
    }
  } else {
    toast({
      title: 'Email Verification error: ',
      description: 'It seems you are not signed please login an try again',
      variant: 'destructive',
    })
  }
}

onMounted(() => {
  componentLoad.value = true
  if (user_auth.data) {
    console.log(user_auth.data)
    email_verified.value = user_auth.data.emailVerified
  }
  componentLoad.value = false
})
</script>

<template>
  <Toaster />
  <div v-if="!componentLoad" class="flex flex-col gap-y-2">
    <Label for="email">Email Address</Label>
    <!-- <Input type="email" name="email" id="email" placeholder="johndoe@gmail.com" /> -->
    <div class="flex items-center justify-between text-sm">
      <span class="font-medium underline">{{ user_auth.data?.email }}</span>
      <div v-if="!user_auth.data?.emailVerified" class="flex items-center gap-1">
        <i class="material-icons text-red-500">error</i>
        <Button
          variant="link"
          class="h-[unset] p-0 text-red-500"
          @click="sendEmailVerificationLink()"
        >
          Verify Email</Button
        >
      </div>
      <div v-else class="flex items-center gap-1">
        <i class="material-icons text-green-500">check_circle</i>
        <Button variant="link" class="h-[unset] p-0 text-green-500"> Email Verified</Button>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col gap-y-2">
    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
    <div class="flex items-center gap-2">
      <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
    </div>
  </div>
</template>
