<script setup lang="ts">
import ChangePassword from '../components/AccountSettings/ChangePassword.vue'
import UpdateAccountName from '../components/AccountSettings/UpdateDisplayName.vue'
import UpdateEmail from '../components/AccountSettings/VerifyEmail.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Switch } from '@/core/components/ui/switch'
import SettingsLayout from '@/core/layouts/SettingsLayout.vue'
</script>

<template>
  <SettingsLayout>
    <main class="grid grid-cols-[minmax(350px,1fr)_1fr] gap-x-4 xl:gap-x-12 2xl:gap-x-16">
      <section class="flex flex-col gap-y-8 divide-y">
        <div class="flex flex-col gap-y-3">
          <UpdateAccountName />
          <UpdateEmail />
          <ChangePassword />
        </div>
        <div class="flex flex-col gap-y-4 py-8">
          <h2 class="text-lg font-bold">Newsletter</h2>
          <div class="flex items-center justify-between">
            <Label for="newsletter" class="text-xs"
              >I want to get a newsletter from the company</Label
            >
            <Switch id="newsletter" />
          </div>
        </div>
      </section>
      <section class="flex flex-col items-center gap-y-4">
        <h2 class="text-lg font-bold">Your Photo</h2>
        <Avatar class="size-24">
          <AvatarImage src="https://placehold.co/96" />
          <AvatarFallback>UI</AvatarFallback>
        </Avatar>
        <div class="flex items-center justify-center gap-x-2">
          <Button size="sm">Update</Button>
          <Button size="sm" variant="destructive">Remove</Button>
        </div>
      </section>
    </main>
  </SettingsLayout>
</template>
