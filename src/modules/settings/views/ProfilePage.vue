<script setup lang="ts">
import Address from '../components/ProfileSettings/Address.vue'
import BasicInformation from '../components/ProfileSettings/BasicInformation.vue'
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Switch } from '@/core/components/ui/switch'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'

const useAuth = useAuthStore()
const { user_auth, user_profile } = useAuth
onMounted(async () => {
  if (!user_profile.isInitialized) {
    console.log('initializing...')
    const profile = await user_profile.getWhere([
      { fieldName: 'uid', operator: '==', value: user_auth.data?.uid },
    ])
    const data = profile.data[0]
    user_profile.set(data)
  }
})
</script>

<template>
  <main class="grid grid-cols-2 gap-x-8 xl:gap-x-12 2xl:gap-x-16">
    <section class="flex flex-col gap-y-8">
      <BasicInformation />
      <Address />
    </section>
    <section class="flex flex-col gap-y-8">
      <div class="flex flex-col gap-y-2">
        <h2 class="text-lg font-bold">Language</h2>
        <div class="flex items-center justify-between">
          <Label class="text-xs"> We can translate this platform for you </Label>
          <Button variant="ghost">English</Button>
        </div>
      </div>
      <div class="flex flex-col gap-y-2">
        <h2 class="text-lg font-bold">Ipsum</h2>
        postCollection
        <div class="flex items-center justify-between">
          <Label for="ipsum" class="text-xs">Lorem ipsum dolor sit amet.</Label>
          <Switch id="ipsum" />
        </div>
      </div>
    </section>
  </main>
</template>
