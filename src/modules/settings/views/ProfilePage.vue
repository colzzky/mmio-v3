<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Switch } from '@/core/components/ui/switch'
import SettingsLayout from '@/core/layouts/SettingsLayout.vue'
</script>

<template>
  <SettingsLayout>
    <main class="grid grid-cols-2 gap-x-8 xl:gap-x-12 2xl:gap-x-16">
      <section class="flex flex-col gap-y-8">
        <form class="flex flex-col gap-y-4">
          <h2 class="text-sm font-bold">Basic Information</h2>
          <div class="flex flex-col gap-y-2">
            <Label for="lastName">Last Name</Label>
            <Input type="text" name="lastName" id="lastName" placeholder="Doe" />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label for="firstName">First Name</Label>
            <Input type="text" name="firstName" id="firstName" placeholder="John" />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label for="email">Contact Email:</Label>
            <Input type="email" name="email" id="email" placeholder="johndoe@work.com" />
          </div>
          <Button class="self-end">Update</Button>
        </form>
        <form class="flex flex-col gap-y-4">
          <h2 class="text-sm font-bold">Address</h2>
          <div class="flex flex-col gap-y-2">
            <Label for="street">Street</Label>
            <Input type="text" name="street" id="street" placeholder="147 Chance Plain" />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label for="city">City</Label>
            <Input type="text" name="city" id="city" placeholder="Delphiaworth" />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label for="state">State</Label>
            <Input type="text" name="state" id="state" placeholder="Rhose Island" />
          </div>
          <div class="grid grid-cols-2 gap-x-4">
            <div class="flex flex-col gap-y-2">
              <Label for="country">Country</Label>
              <Input type="text" name="country" id="country" placeholder="United States" />
            </div>
            <div class="flex flex-col gap-y-2">
              <Label for="zipCode">Zip Code</Label>
              <Input type="text" name="zipCode" id="zipCode" placeholder="72801-5565" />
            </div>
          </div>
          <Button class="self-end">Update</Button>
        </form>
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
          <div class="flex items-center justify-between">
            <Label for="ipsum" class="text-xs">Lorem ipsum dolor sit amet.</Label>
            <Switch id="ipsum" />
          </div>
        </div>
      </section>
    </main>
  </SettingsLayout>
</template>
