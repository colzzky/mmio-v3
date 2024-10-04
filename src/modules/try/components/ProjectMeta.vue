<script lang="ts" setup>
import { Button } from '@/core/components/ui/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/core/components/ui/dialog'
import Input from '@/core/components/ui/input/Input.vue';
import { useProjectCenter } from '@/stores/projectCenter'
const project_center = useProjectCenter()
const { project_center_dialog: pcd, } = project_center

</script>
<template>

    <DialogHeader class="pb-4">
        <DialogTitle class="font-bold text-xl">Create a Project with Meta</DialogTitle>
        <DialogDescription>
            These are the services we offer for Meta
        </DialogDescription>
    </DialogHeader>
    <!-- Should be component -->

    <div v-if="pcd.activePage === 'services'">
        <div class="max-h-[40vh] overflow-y-auto">
            <div v-for="service in pcd.active_platform?.services" :key="service.name"
                class="hover:bg-gray-200 group flex gap-x-3 rounded-md p-2 text-sm leading-6 items-center transition-all transition-duration: 150ms;">
                <div class="bg-black text-white rounded-full h-8 w-8 flex items-center justify-center">
                    <i class='bx text-xl' :class="service.icon"></i>
                </div>
                <div class="flex flex-col gap-y-0">
                    <span class="font-semibold">{{ service.name }}</span>
                    <span class="text-xs text-gray-700 text font-medium">{{ service.desc }}</span>
                </div>
            </div>
        </div>
        <DialogFooter class="pt-4">
            <div class="flex justify-end items-center gap-2">
                <Button variant="outline" @click="pcd.returnToPlaforms()">
                    Back
                </Button>
                <Button variant="outline" @click="pcd.choosePage()">
                    Proceed
                </Button>
            </div>
        </DialogFooter>
    </div>

    <div v-if="pcd.activePage === 'chooseAPage'">
        <div class="max-h-[40vh] overflow-y-auto">
            <div class="grid gap-5">
                <div class="px-2 flex flex-col gap-y-2">
                    <span class="text-sm font-semibold">Name of this Automation/Project</span>
                    <Input type="text" placeholder="Page name" class="shadow-none" />

                </div>
                <div class="px-2 flex flex-col gap-y-2">
                    <div class="grid gap-1">
                        <span class="text-sm font-semibold">Select a Page you will use</span>
                        <span class="text-xs">Can’t see your pages?
                            <a href="#" class="text-blue-500 hover:text-blue-700">Click here</a> to import your pages
                            first</span>
                    </div>
                    <Input type="text" placeholder="Page name" class="shadow-none" />

                </div>
            </div>
        </div>
        <DialogFooter class="pt-4">
            <div class="flex justify-end items-center gap-2">
                <Button variant="outline" @click="pcd.returnToPlaforms()">
                    Back
                </Button>
                <Button variant="outline">
                    Create
                </Button>
            </div>
        </DialogFooter>
    </div>

</template>