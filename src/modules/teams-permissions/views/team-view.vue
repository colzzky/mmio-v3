<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue';
import Input from '@/core/components/ui/input/Input.vue';
import Switch from '@/core/components/ui/switch/Switch.vue';
import type { TeamData } from '@/core/types/TeamTypes';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import { reactive } from 'vue';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { z, type ZodRawShape } from 'zod';
const route = useRoute();
const teamStore = useTeamStore()
const authStore = useAuthStore()
const { user_auth, user, user_team_refs } = authStore

const team_id = route.params.team_id
const pageLoad = ref<boolean>(true)

const current_team = reactive({
    data: <TeamData | null>null,
    get_current_team() {
        const team = user_team_refs.data.find(team => team.tm_id === team_id)
        if (team) {
            this.data = team
        }
        console.log(this.data)
    }
})

async function fetch_validate_team() {
    current_team.get_current_team()
    if (!current_team.data) {
        await router.push({ name: 'teams' })
    }
    pageLoad.value = false
}

interface InviteMember {
    member_email: string,
}

const choose_member_form = reactive({
    emails: ["superadmin@mmio.com", 'banana@gmail.com', 'saunty@gmail.com', 'paulfdelavega@gmail.com'],
    dataInput: <InviteMember>{ member_email: '' },
    errors: <InviteMember>{ member_email: '' },
    schema(input: InviteMember): ZodRawShape {
        return {
            member_email: z.union([
                z.literal(''),
                z.string().email(`${input.member_email} must be a valid email`),
            ])
        }
    },
    validateSingleField(field: keyof InviteMember): boolean {
        const value = this.dataInput[field]
        this.errors[field] = ''
        const result = z.object(this.schema(this.dataInput) as ZodRawShape).shape[field].safeParse(value)
        if (!result.success) {
            console.log(result.error.errors[0])
            this.errors[field] = result.error.errors[0].message
            return false
        }
        return true
    },
    async validateDataInput(): Promise<boolean> {
        Object.keys(this.errors).forEach((key) => {
            const field = key as keyof InviteMember
            this.errors[field] = ''
        })
        let errs = ''

        const invalid = this.emails.some(email => {
            const checker = z.object(this.schema({ member_email: email }) as ZodRawShape).safeParse({ member_email: email })
            if (!checker.success) {
                errs = checker.error.errors[0].message
                return true
            }
            return false
        })

        if (invalid) {
            this.errors.member_email = errs
            return false
        }
        return true
    },
    addEmail() {
        const validate = this.validateSingleField('member_email')
        if (validate && this.dataInput.member_email) {
            this.emails.push(this.dataInput.member_email)
            this.dataInput.member_email = ''
        }
    },
    removeEmail(index: number) {
        this.emails.splice(index, 1)
    },
    inviteEmails() {
        //send an invite request to the backend
    },
    reset() {
        this.dataInput = { member_email: '' }
        this.errors = { member_email: '' }
    }
})

onMounted(async () => {
    if (user_team_refs.isInitialized) {
        await fetch_validate_team()
    }
    pageLoad.value = false
})

watch(() => user_team_refs.isInitialized, async (initlized) => {
    if (initlized) {
        await fetch_validate_team()
    }
    // Perform additional actions if needed when myData changes
});

</script>
<template>
    <div v-if="!pageLoad">
        <div v-if="current_team.data" class="space-y-4">
            <div class="flex items-center space-x-2">
                <Button variant="ghost" class="flex" @click="router.push({name:'teams'})"><i class="material-icons text-md">arrow_back</i></Button>
                <span class="font-bold text-lg">{{ current_team.data.name }}</span>
            </div>
            <div class="grid grid-cols-12 gap-x-4">
                <div class="col-span-5 self-start space-y-4 ">
                    <div class="text-lg font-bold">Settings</div>
                    <div class="border-2 rounded-lg py-5 px-4 bg-gray-100 border-gray-200 space-y-3">
                        <div class="flex flex-col">
                            <span class="font-semibold text-sm">Team Name:</span>
                            <div class="flex justify-between items-center">
                                <span>{{ current_team.data.name }}</span>
                                <Button variant="ghost"
                                    class="font-bold text-sm text-blue-500 hover:text-blue-700 p-0">Change name</Button>
                            </div>
                        </div>

                        <div class="flex flex-col">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-sm">Activate Invite Link:</span>
                                <Switch />

                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs w-64 truncate">www.mmiv3.com/invite/{{
                                    current_team.data.inviteLink }}</span>
                                <Button class="text-blue-500 p-0" size="sm" variant="ghost"><i
                                        class="material-icons">link</i> Copy link</Button>
                            </div>
                            <div class="flex flex-col justify-end h-14">
                                <div class="flex justify-between items-center">
                                    <Button class="text-red-500 hover:text-red-700 p-0" size="sm"
                                        variant="ghost">Disassemble team</Button>
                                    <Button class="text-xs" size="xs" variant="destructive"><i
                                            class="material-icons mr-2 text-sm">exit_to_app</i>Leave Team</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="text-lg font-bold">Invite Users</div>
                        <div class="border-2 rounded-lg">
                            <div class="max-h-[10vh]  overflow-y-scroll  p-4 py-2 flex flex-row flex-wrap gap-2 items-center">
                                <div v-for="email, index in choose_member_form.emails" :id="email"
                                    class="p-2 px-3 rounded-full bg-blue-500 flex items-center space-x-2 self-start">
                                    <span class="text-white font-semibold text-xs">{{ email }}</span>
                                    <button @click="choose_member_form.removeEmail(index)"
                                        class="cursor-pointer text-white focus:outline-none flex items-center">
                                        <i class="material-icons text-sm">close</i>
                                    </button>
                                </div>

                                <div class="rounded-full">
                                    <Input v-model="choose_member_form.dataInput.member_email"
                                        @blur="choose_member_form.addEmail()"
                                        @keyup.enter="choose_member_form.addEmail()" type="text"
                                        placeholder="User Email"
                                        class="border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b focus-visible:border-blue-600 text-sm" />
                                </div>


                            </div>
                            <div class="w-full">
                                <Button  :disabled="!choose_member_form.emails.length" class=" w-full rounded-t-non" size="xs">Invite
                                    Users</Button>
                            </div>
                        </div>
                        <div v-if="choose_member_form.errors.member_email" for="name"
                            class="flex items-center gap-1 text-xs text-red-500">
                            <i class="material-icons text-sm">error</i>
                            {{ choose_member_form.errors.member_email }}
                        </div>
                    </div>
                </div>

                <div class="col-span-7 self-start space-y-4">
                    <div class="text-lg font-bold">Member list</div>
                    <div class="border-2 rounded-lg"></div>
                </div>

            </div>
        </div>
        <!-- {{ current_team.data }} -->

    </div>
    <div v-else>
        loadingg....
    </div>
</template>