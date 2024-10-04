<script lang="ts" setup>
import { Button } from '@/core/components/ui/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/core/components/ui/dialog'
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
    <div class="max-h-[40vh] overflow-y-auto">
        <div v-if="pcd.activePage === 'services'">
            <div v-for="service in pcd.active_platform?.services" :key="service.name"
                class="hover:bg-gray-200 group flex gap-x-3 rounded-md p-2 text-sm leading-6 items-center transition-all transition-duration: 150ms;">
                <div class="bg-black text-white rounded-full h-8 w-8 flex items-center justify-center">
                    <i class='bx text-xl' :class="service.icon"></i>
                </div>
                <div class="flex flex-col gap-y-0">
                    <span class="font-semibold">{{ service.name }}</span>
                    <span class="text-xs text-gray-700 text font-medium">{{ service.name }}</span>
                </div>
            </div>
        </div>
    </div>
    <DialogFooter class="pt-4">
        <div class="flex justify-end items-center gap-2">
            <Button variant="outline" @click="pcd.returnToPlaforms()">
                Back
            </Button>
            <Button variant="outline">
                Proceed
            </Button>
        </div>
    </DialogFooter>
</template>