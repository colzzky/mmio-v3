<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Dialog from '@/core/components/ui/dialog/Dialog.vue'
import DialogContent from '@/core/components/ui/dialog/DialogContent.vue'
import Input from '@/core/components/ui/input/Input.vue'
import type { Service } from '@/modules/meta/routes'
import { reactive, ref } from 'vue'

export interface Platform {
    name: string
    desc: string
    href: string
    icon: string
}

const platforms: Platform[] = [
    {
        name: 'Meta',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
        href: '#',
        icon: 'bxl-meta',
    },
    {
        name: 'Email Marketing',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
        href: '#',
        icon: 'bx-envelope',
    },
    {
        name: 'Google My Business',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
        href: '#',
        icon: 'bxl-google',
    },
    {
        name: 'Whatsapp',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
        href: '#',
        icon: 'bxl-whatsapp',
    },
    {
        name: 'SMS Marketing',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
        href: '#',
        icon: 'bx-message-rounded',
    },
    {
        name: 'E-Commerce',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
        href: '#',
        icon: 'bx-shopping-bag',
    },
    {
        name: 'OmniChannel',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
        href: '#',
        icon: 'bx-group',
    },
]

enum NewWorkspaceStep {
    Create = "CREATE",
    Team = "TEAM",
    Processing = "PROCESSING",
    Complete = "COMPLETE",
}

const workspace_modal = reactive({
    isOpen: false,
    steps:<NewWorkspaceStep>NewWorkspaceStep.Create,
    openCloseModal() {
        if (this.isOpen) {
            this.isOpen = false
            this.steps = NewWorkspaceStep.Create
        }else{
            this.isOpen = true
        }
    }
})

</script>
<template>
    <div class="flex flex-col items-start justify-normal gap-2">
        <Button @click="workspace_modal.openCloseModal()">Create new Workspace</Button>
        <Button>Create a team</Button>
    </div>

    <Dialog v-model:open="workspace_modal.isOpen">
        <DialogContent @interact-outside="(e) => e.preventDefault()" class="min-h-[75%] sm:max-w-[75%]">
            <div>
                <div class="flex justify-end">
                    <div>
                        <button
                            class="right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label="Close" @click="workspace_modal.openCloseModal()">
                            <i class="material-icons">close</i>
                        </button>
                    </div>
                </div>

                <!-- This part is changing -->
                <div v-if="workspace_modal.steps === NewWorkspaceStep.Create" class="container mx-auto pt-10">
                    <div class="grid grid-cols-2 gap-5">
                        <div class="col-span-1 space-y-10">
                            <div
                                class="text-5xl font-bold text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-transparent">
                                Let’s create your new workspace!</div>
                            <div class="grid grid-cols-2">
                                <div v-for="platform in platforms" :key="platform.name"
                                    class="transition-duration: 150ms; group flex cursor-pointer items-center gap-x-3 rounded-md p-2 text-sm leading-6 transition-all hover:bg-gray-200">
                                    <i class="bx text-2xl" :class="platform.icon"></i>
                                    <div class="flex flex-col gap-y-0">
                                        <span class="font-semibold">{{ platform.name }}</span>
                                        <span class="text text-xs font-medium text-gray-700">Test Description</span>
                                    </div>
                                </div>
                            </div>
                            <div class="pt-5">
                                <div class="space-y-4">
                                    <Input type="text" placeholder="Workspace Name"
                                        class="border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b-2 focus-visible:border-blue-600 text-4xl font-thin" />
                                    <div class="flex justify-between">
                                        <span class="w-96 flex-none">Upon creation of new workspace it mean you agreed
                                            to our <span class="text-blue-500 font-bold">terms and
                                                conditions.</span></span>
                                        <Button @click="workspace_modal.steps = NewWorkspaceStep.Team"
                                            class="bg-red-500 text-white hover:bg-red-700">Continue</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-1 mx-10">
                            <div class="flex items-center justify-center">

                                <img src="@/assets/undraw_deconstructed_alud.svg" alt="Centered SVG">
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="workspace_modal.steps === NewWorkspaceStep.Team" class="container mx-auto pt-10">
                    <div class="grid grid-cols-2 gap-5">
                        <div class="col-span-1 space-y-10">
                            <div
                                class="text-5xl font-bold text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-transparent">
                                Choose a team for your workspace!</div>
                            <div class="grid grid-cols-2">
                            </div>
                            <div class="pt-5">
                                <div class="space-y-4">
                                    <Input type="text" placeholder="Workspace Name"
                                        class="border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b-2 focus-visible:border-blue-600 text-4xl font-thin" />
                                    <div class="flex justify-between">
                                        <span class="w-96 flex-none">Upon creation of new workspace it mean you agreed
                                            to our <span class="text-blue-500 font-bold">terms and
                                                conditions.</span></span>
                                        <Button @click="workspace_modal.steps = NewWorkspaceStep.Processing"
                                            class="bg-red-500 text-white hover:bg-red-700">Create Workspace</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-1 mx-10">
                            <div class="flex items-center justify-center">

                                <img src="@/assets/undraw_deconstructed_alud.svg" alt="Centered SVG">
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="workspace_modal.steps === NewWorkspaceStep.Processing" class="container mx-auto pt-10">
                    <div class="grid grid-cols-2 gap-5">
                        <div class="col-span-1 space-y-10">
                            <div
                                class="text-5xl font-bold text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-transparent">
                                Creating a workspace.....</div>
                            <div class="grid grid-cols-2">
                            </div>
                            <div class="pt-5">
                                <div class="space-y-4">
                                    <Input type="text" placeholder="Workspace Name"
                                        class="border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b-2 focus-visible:border-blue-600 text-4xl font-thin" />
                                    <div class="flex justify-between">
                                        <span class="w-96 flex-none">Upon creation of new workspace it mean you agreed
                                            to our <span class="text-blue-500 font-bold">terms and
                                                conditions.</span></span>
                                        <Button @click="workspace_modal.steps = NewWorkspaceStep.Processing"
                                            class="bg-red-500 text-white hover:bg-red-700">Create Workspace</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-1 mx-10">
                            <div class="flex items-center justify-center">

                                <img src="@/assets/undraw_deconstructed_alud.svg" alt="Centered SVG">
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </DialogContent>
    </Dialog>
</template>
