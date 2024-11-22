<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Dialog from '@/core/components/ui/dialog/Dialog.vue'
import DialogContent from '@/core/components/ui/dialog/DialogContent.vue'
import DialogTitle from '@/core/components/ui/dialog/DialogTitle.vue';
import Input from '@/core/components/ui/input/Input.vue';
import type { TeamData } from '@/core/types/TeamTypes';
import { workspace_data, type WorkspaceData } from '@/core/types/WorkSpaceTypes';
import { getWhereAny } from '@/core/utils/firebase-collections';
import { uiHelpers } from '@/core/utils/ui-helper';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import { useWorkspaceStore } from '@/stores/WorkspaceStore';
import { VisuallyHidden } from 'radix-vue';
import { reactive, watch, onMounted, ref } from 'vue';
import { unknown, z, type ZodRawShape } from 'zod';

const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
const teamStore = useTeamStore()
const { team: team_model, team_workspace_refs: tm_ws_refs } = teamStore
const { workspace: ws_model } = workspaceStore
const { user_auth } = authStore
const componentLoad = ref<boolean>(false)

interface PlatformDisplay {
    name: string
    desc: string
    href: string
    icon: string
}
interface WorkspaceInput {
    name: string,
    team: string // others that needs input like date etc
}
type WorkspaceCreate = Pick<WorkspaceInput, 'name'>
enum NewWorkspaceStep {
    Create = "CREATE",
    Team = "TEAM",
    Processing = "PROCESSING",
    Complete = "COMPLETE",
}
const platforms: PlatformDisplay[] = [
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

const props = defineProps<{ open_modal: boolean }>()

const emit = defineEmits<{
    (e: 'return', value: WorkspaceData|null): void
}>()

watch(() => props.open_modal, (newTrigger) => {
    if (newTrigger) {
        workspace_modal.isOpen = true
    }
})

const workspace_create = reactive({
    dataInput: <WorkspaceCreate>{ name: '' },
    errors: <WorkspaceCreate>{ name: '' },
    schema: <ZodRawShape>{
        name: z.string().min(1, { message: 'Workspace name is required' }),
    },

    validateSingleField(field: keyof WorkspaceCreate): void {
        const value = this.dataInput[field]
        this.errors[field] = ''
        const result = z.object(this.schema as ZodRawShape).shape[field].safeParse(value)
        if (!result.success) {
            console.log(result.error.errors[0])
            this.errors[field] = result.error.errors[0].message
        }
    },
    async validateDataInput(): Promise<boolean> {
        Object.keys(this.errors).forEach((key) => {
            const field = key as keyof WorkspaceCreate
            this.errors[field] = ''
        })
        const result = z.object(this.schema as ZodRawShape).safeParse(this.dataInput)

        if (!result.success) {
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof WorkspaceCreate
                this.errors[field] = err.message
            })
            return false
        } else {
            return true
        }
    },
    reset() {
        this.dataInput = { name: '' }
        this.errors = { name: '' }
    }
})

const workspace_modal = reactive({
    isOpen: false,
    steps: <NewWorkspaceStep>NewWorkspaceStep.Create,
    data: {
        workspace_data: <WorkspaceData | null>null,
        name: '',
        team: <TeamData | null>null,
    },
    processing_msg: '',
    async continue() {
        if (this.steps === NewWorkspaceStep.Create) {
            const validated = await workspace_create.validateDataInput()
            if (validated) {
                this.data.name = workspace_create.dataInput.name
                console.log(this.data.name)
                this.steps = NewWorkspaceStep.Team
            }
        }
        else if (this.steps === NewWorkspaceStep.Team) {
            this.data.team = workspace_selected_team.value
            this.steps = NewWorkspaceStep.Processing
            this.createWorkspace()
        }
        else if (this.steps === NewWorkspaceStep.Processing) {

        }
    },
    previous() {
        if (this.steps === NewWorkspaceStep.Team) {
            this.steps = NewWorkspaceStep.Create
        }
    },
    close() {
        const pass_workspace_data = this.data.workspace_data?{...this.data.workspace_data}:null
        console.log(pass_workspace_data)
        this.steps = NewWorkspaceStep.Create
        this.data = {
            workspace_data: null,
            name: '',
            team: null,
        }
        workspace_create.reset()
        this.isOpen = false
        emit('return', pass_workspace_data)
    },
    async createWorkspace() {
        this.processing_msg = 'Creating a new workspace'
        if (user_auth.data) {
            //Create a new sowkrspace
            ws_model.reInit()
            ws_model.data.name = this.data.name
            ws_model.data.team_id = this.data.team ? this.data.team.tm_id : ''
            ws_model.data.owner_uid = user_auth.data.uid
            const post = await ws_model.createUpdate('new')
            if (post.status) {
                if (post.data.team_id) await this.create_workspace_team_refs(post.data)
                this.data.workspace_data = post.data
                this.close()
            }else{
                console.log('Something wentwrong')
                return;
            }
        }
    },
    async create_workspace_team_refs(workspace: WorkspaceData) {
        tm_ws_refs.reInit()
        tm_ws_refs.data.owner_uid = workspace.owner_uid
        tm_ws_refs.data.workspace_id = workspace.ws_id
        const create_refs = await tm_ws_refs.createUpdate(workspace.team_id, 'new')
        if (create_refs.status) {
            return true
        }
        return false
    }
})

const workspace_selected_team = ref<TeamData | null>(null)
function select_team(team_data: TeamData | null) {
    workspace_selected_team.value = JSON.parse(JSON.stringify(team_data))
}

const user_created_teams = ref<TeamData[]>([])
async function get_user_team() {
    if (user_auth.data) {
        const get = await getWhereAny('team', 'teams', {}, ['team_members'], [
            {
                fieldName: 'owner_uid',
                operator: '==',
                value: user_auth.data.uid
            }
        ])
        console.log(get)
        if (get.status) {
            user_created_teams.value = get.data
        }
    }
}

onMounted(async () => {
    componentLoad.value = true
    await get_user_team()
    componentLoad.value = false

})

</script>
<template>
    <Dialog v-model:open="workspace_modal.isOpen">
        <DialogContent @escape-key-down="(e) => e.preventDefault()" @interact-outside="(e) => e.preventDefault()"
            class="min-h-[75%] sm:max-w-[75%]">
            <div v-if="!componentLoad">
                <div>
                    <VisuallyHidden>
                        <DialogTitle></DialogTitle>
                    </VisuallyHidden>
                </div>
                <div>
                    <div class="flex justify-end">
                        <div>
                            <button
                                v-if="workspace_modal.steps != NewWorkspaceStep.Processing && workspace_modal.steps != NewWorkspaceStep.Complete"
                                class="right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Close" @click="workspace_modal.close()">
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
                                        <Input v-model="workspace_create.dataInput.name"
                                            @blur="workspace_create.validateSingleField('name')" type="text"
                                            placeholder="Workspace Name"
                                            class="border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b-2 focus-visible:border-blue-600 text-4xl font-thin" />
                                        <div v-if="workspace_create.errors.name" for="name"
                                            class="flex items-center gap-1 text-xs text-red-500">
                                            <i class="material-icons text-sm">error</i>
                                            {{ workspace_create.errors.name }}
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="w-96 flex-none">Upon creation of new workspace it mean you
                                                agreed
                                                to our <span class="text-blue-500 font-bold">terms and
                                                    conditions.</span></span>
                                            <Button @click="workspace_modal.continue()"
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
                            <div class="col-span-1 space-y-4">
                                <div
                                    class="text-5xl font-bold text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-transparent">
                                    Choose a team for your workspace!</div>
                                <div class="grid grid-cols-2">
                                </div>
                                <div>
                                    <div class="space-y-4">
                                        <div class="space-y-8">
                                            <div class="space-y-2">
                                                <span class="font-bold">Chosen Team:</span>
                                                <div v-if="!workspace_selected_team">No Selected team</div>
                                                <div v-else>
                                                    <div class="flex items-center gap-x-4">
                                                        <div class="w-10 h-10 rounded-full bg-blue-500">
                                                        </div>
                                                        <div class="f">{{ workspace_selected_team.name }}</div>
                                                    </div>
                                                </div>
                                                <span class="cursor-pointer font-bold text-blue-500 hover:text-blue-700"
                                                    @click=select_team(null)>I prefer to work alone</span>
                                            </div>

                                            <div class->
                                                <div class="w-full border border-gray-200 bg-gray-100 rounded-md">
                                                    <div class="p-2 flex items-center">
                                                        <i class="bx text-2xl bx-search"></i>
                                                        <Input type="text" placeholder="Search"
                                                            class="border-x-0 border-y-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-4 bg-gray-100" />
                                                    </div>
                                                    <hr>
                                                    <div class="p-2 py-4">
                                                        <div class="space-y-4">
                                                            <div>
                                                                <span class="font-bold">Available teams:</span>
                                                            </div>
                                                            <div v-if="user_created_teams.length > 0" v-for="team, team_index in user_created_teams"
                                                                :key="team.tm_id"
                                                                class="flex justify-between items-center hover:bg-gray-200 py-2 px-4 rounded-lg">
                                                                <div class="flex items-center gap-x-4">
                                                                    <div class="w-10 h-10 rounded-full bg-blue-500">
                                                                    </div>
                                                                    <div class="f">{{ team.name }}</div>
                                                                </div>
                                                                <div>
                                                                    <Button @click=select_team(team)
                                                                        class="text-blue-500 font-bold hover:text-blue-700"
                                                                        variant="ghost">Choose team</Button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span>Cant find your team? <RouterLink
                                                                        :to="{ name: 'teams' }"
                                                                        class="cursor-pointer hover:text-blue-700 font-bold text-blue-500">
                                                                        create a team</RouterLink>
                                                                    first before proceeding</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div class="flex justify-between">
                                            <Button @click="workspace_modal.previous()"
                                                class="text-red-500 hover:text-red-700"
                                                variant="ghost">Previous</Button>
                                            <Button @click="workspace_modal.continue()"
                                                class="bg-red-500 text-white hover:bg-red-700">Create Workspace</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-1 mx-10 p-10">
                                <div class="flex items-center justify-center">
                                    <img src="@/assets/undraw_team_re_0bfe.svg" alt="Centered SVG">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="workspace_modal.steps === NewWorkspaceStep.Processing" class="container mx-auto pt-10">
                        <div class="grid grid-cols-1 gap-5 ">
                            <div class="col-span-1">
                                <div class="flex items-center justify-center">
                                    <div
                                        class="text-5xl font-bold text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-transparent ">
                                        Some random quotes here...</div>
                                </div>
                            </div>
                            <div class="col-span-1 pt-20">
                                <div class="flex flex-col items-center justify-center space-y-2">
                                    <img src="@/assets/undraw_loading_re_5axr.svg" alt="Centered SVG"
                                        class="h-[25vh] w-[25vh]">
                                    <div class="flex items-center gap-x-2">
                                        <i class="material-icons animate-spin text-md">donut_large</i>
                                        <span class="text-md font-semibold">Please wait while we prepare your
                                            workspace</span>
                                    </div>
                                    <span class="text-xs">{{ workspace_modal.processing_msg }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="workspace_modal.steps === NewWorkspaceStep.Complete" class="container mx-auto pt-10">
                        <div class="grid grid-cols-1 gap-5 ">
                            <div class="col-span-1">
                                <div class="flex items-center justify-center">
                                    <div
                                        class="text-5xl font-bold text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-transparent ">
                                        Workspace successfuly Created!</div>
                                </div>
                            </div>
                            <div class="col-span-1 pt-20">
                                <div class="flex flex-col items-center justify-center space-y-2">
                                    <img src="@/assets/undraw_vintage_414k.svg" alt="Centered SVG"
                                        class="h-[25vh] w-[25vh]">
                                    <div class="flex items-center gap-x-2">
                                        <i class="material-icons animate-spin text-md">donut_large</i>
                                        <span class="text-md font-semibold">Please wait while we redirect you to your
                                            workspace</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="flex items-center justify-center">
                <div class="container mx-auto">
                    <div class="grid grid-cols-1 gap-5">
                        <div class="col-span-1">
                            <div class="flex flex-col items-center justify-center space-y-2">
                                <img src="@/assets/undraw_vintage_414k.svg" alt="Centered SVG"
                                    class="h-[25vh] w-[25vh]">
                                <div class="flex items-center gap-x-2">
                                    <i class="material-icons animate-spin text-md">donut_large</i>
                                    <span class="text-md font-semibold">Please wait while we initialize the first step
                                        on
                                        creating your workspace.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
<style></style>
