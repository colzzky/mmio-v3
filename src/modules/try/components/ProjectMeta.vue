<script lang="ts" setup>
import { Button } from '@/core/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import Input from '@/core/components/ui/input/Input.vue'
import { useProjectCenter } from '@/stores/projectCenter'

const project_center = useProjectCenter()
const { project_center_dialog: pcd } = project_center
</script>
<template>
  <DialogHeader class="pb-4">
    <DialogTitle class="text-xl font-bold">Create a Project with Meta</DialogTitle>
    <DialogDescription> These are the services we offer for Meta </DialogDescription>
  </DialogHeader>
  <!-- Should be component -->

  <div v-if="pcd.activePage === 'services'">
    <div class="max-h-[40vh] overflow-y-auto">
      <div
        v-for="[key, service] in pcd.active_platform?.services"
        :key="key"
        class="group grid grid-cols-[var(--icon-size),1fr] gap-x-4 rounded-md p-2 text-sm/6 transition-all [--icon-size:2rem] hover:bg-gray-200"
      >
        <div
          class="flex size-8 items-center justify-center self-center rounded-full bg-black text-white"
        >
          <i :class="['bx text-xl', service.icon]" />
        </div>
        <div class="flex flex-col gap-y-0">
          <span class="font-semibold">{{ service.label }}</span>
          <span class="text text-xs font-medium text-gray-700">{{ service.description }}</span>
        </div>
      </div>
    </div>
    <DialogFooter class="pt-4">
      <div class="flex items-center justify-end gap-2">
        <Button variant="outline" @click="pcd.returnToPlaforms()"> Back </Button>
        <Button variant="outline" @click="pcd.choosePage()"> Proceed </Button>
      </div>
    </DialogFooter>
  </div>

  <div v-if="pcd.activePage === 'chooseAPage'">
    <div>
      <div class="grid gap-5">
        <div class="flex flex-col gap-y-2 px-2">
          <span class="text-sm font-semibold">Name of this Automation/Project</span>
          <Input type="text" placeholder="Page name" class="shadow-none" />
        </div>
        <div class="flex flex-col gap-y-2 px-2">
          <div class="grid gap-1">
            <span class="text-sm font-semibold">Select a Page you will use</span>
            <span class="text-xs"
              >Can’t see your pages?
              <a href="#" class="text-blue-500 hover:text-blue-700">Click here</a> to import your
              pages first</span
            >
          </div>
          <Input type="text" placeholder="Page name" class="shadow-none" />
        </div>
      </div>
    </div>
    <DialogFooter class="pt-4">
      <div class="flex items-center justify-end gap-2">
        <Button variant="outline" @click="pcd.returnToPlaforms()"> Back </Button>
        <Button variant="outline"> Create </Button>
      </div>
    </DialogFooter>
  </div>
</template>
