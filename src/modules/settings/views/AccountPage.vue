<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Switch } from '@/core/components/ui/switch'
import SettingsLayout from '@/core/layouts/SettingsLayout.vue'
import UpdateAccountName from '../components/AccountSettings/UpdateDisplayName.vue'
import UpdateEmail from '../components/AccountSettings/VerifyEmail.vue'
</script>

<template>
  <SettingsLayout>
    <main class="grid grid-cols-[minmax(350px,1fr)_1fr] gap-x-4 xl:gap-x-12 2xl:gap-x-16">
      <section class="flex flex-col gap-y-8 divide-y">
        <div class="flex flex-col gap-y-6">
          <UpdateAccountName />
          <UpdateEmail/>
          <div class="flex flex-col gap-y-2">
            <Label for="password">Password</Label>
            <!-- <Input type="password" name="password" id="password" placeholder="johndoe@gmail.com" /> -->
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">********</span>
              <Button variant="link" class="h-[unset] p-0 text-blue-500">Change Password</Button>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-y-4 py-8">
          <h2 class="text-lg font-bold">Newsletter</h2>
          <div class="flex items-center justify-between">
            <Label for="newsletter" class="text-xs">I want to get a newsletter from the company</Label>
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
