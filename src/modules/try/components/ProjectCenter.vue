<script lang="ts" setup>
import { reactive, ref } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/core/components/ui/dialog'
import { useProjectCenter } from '@/stores/projectCenter'
import ProjectMeta from './ProjectMeta.vue'
import { storeToRefs } from 'pinia';
const project_center = useProjectCenter()
const { project_center_dialog: pcd, platforms } = project_center

</script>
<template>
    <div>
        <button class="flex items-center gap-x-1" @click="pcd.openProjectCenter()">
            <i class="material-icons text-sm">grain</i>
            <span class="text-xs font-medium">New</span>
        </button>
        <Dialog v-model:open="pcd.isOpen">
            <DialogContent @interact-outside="(e) => e.preventDefault()">
                <div class="relative">
                    <button @click="pcd.close()"
                        class="absolute top-0 right-0 bg-transparent border-0 text-gray-500 text-xl cursor-pointer focus:outline-none hover:text-gray-700"
                        aria-label="Close">
                        <i class="material-icons">close</i>
                    </button>
                </div>
                <div v-if="!pcd.active_platform">
                    <DialogHeader class="pb-4">
                        <DialogTitle class="font-bold text-xl">Select a new Platform for Automation</DialogTitle>
                        <DialogDescription>
                            Choose a platform you want to use MMIO
                        </DialogDescription>
                    </DialogHeader>
                    <!-- Should be component -->
                    <div v-if="pcd.activePage === 'platforms'" class="max-h-[40vh] overflow-y-auto">
                        <div v-for="platform in platforms" :key="platform.name"
                            class="hover:bg-gray-200 group flex gap-x-3 rounded-md p-2 text-sm leading-6 items-center transition-all transition-duration: 150ms; cursor-pointer"
                            @click="pcd.choosePlatform(platform)">
                            <i class='bx text-2xl' :class="platform.icon"></i>
                            <div class="flex flex-col gap-y-0">
                                <span class="font-semibold">{{ platform.name }}</span>
                                <span class="text-xs text-gray-700 text font-medium">Test Description</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter class="pt-4">
                    </DialogFooter>
                </div>
                <div v-else>
                    <ProjectMeta v-if="pcd.active_platform?.name === 'Meta'" />
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>