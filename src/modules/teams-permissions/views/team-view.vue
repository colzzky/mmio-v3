<script lang="ts" setup>
import Avatar from '@/core/components/ui/avatar/Avatar.vue';
import AvatarFallback from '@/core/components/ui/avatar/AvatarFallback.vue';
import AvatarImage from '@/core/components/ui/avatar/AvatarImage.vue';
import Button from '@/core/components/ui/button/Button.vue';
import Input from '@/core/components/ui/input/Input.vue';
import Switch from '@/core/components/ui/switch/Switch.vue';
import { toast } from '@/core/components/ui/toast';
import Toaster from '@/core/components/ui/toast/Toaster.vue';
import { user_data, type UserData } from '@/core/types/AuthUserTypes';
import type { InvitationData } from '@/core/types/InvitationTypes';
import { default_access } from '@/core/types/PermissionTypes';
import { TeamRole, type TeamData, type TeamInvitation, type TeamMembersData } from '@/core/types/TeamTypes';
import { getWhereAny, postCollectionBatch } from '@/core/utils/firebase-collections';
import { uiHelpers } from '@/core/utils/ui-helper';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useInvitationStore } from '@/stores/invitationStore';
import { useTeamStore } from '@/stores/teamStore';
import { reactive } from 'vue';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { z, type ZodRawShape } from 'zod';
const route = useRoute();
const teamStore = useTeamStore()
const authStore = useAuthStore()
const invitationStore = useInvitationStore()
const { invitation, createTeamInvite } = invitationStore
const { user_auth, user, user_team_refs } = authStore
const { team: team_model } = teamStore

const team_id = route.params.team_id
const pageLoad = ref<boolean>(true)

const current_team = reactive({
    data: <TeamData | null>null,
    members_info: <{ [key: string]: UserData }>({}),
    invite_load: <boolean>false,
    member_email_list: <string[]>[],
    get_current_team() {
        const team = user_team_refs.data.find(team => team.tm_id === team_id)
        if (team) {
            this.data = team
        }
        console.log(this.data)
    },
    async get_members() {
        if (this.data && this.data.team_members) {
            const non_pending_members = <string[]>[]
            this.data.team_members.forEach(member => {
                if (member.uid) {
                    non_pending_members.push(member.uid)
                }
                if (member.invitation) {
                    this.member_email_list.push(member.invitation.email)
                }
            })
            const members = await getWhereAny('user', 'users', {}, [], [
                { fieldName: 'uid', operator: "in", value: non_pending_members }
            ])
            if (members.status) {
                members.data.forEach(member => {
                    this.members_info[member.uid] = member
                    const user_member_email = member.email ? member.email : ''
                    if (user_member_email && !this.member_email_list.includes(user_member_email)) {
                        this.member_email_list.push(user_member_email)
                    }
                })
            }

        }
    },
    async inviteMembers(): Promise<void> {
        //This should be called in the BACKEND!!!!
        /**
         * Create a unique invite code that will be sent to user
         * Make the member invite pending
         * If member access the link he/she will be referenced
         */
        this.invite_load = true
        if (this.data) {
            team_model.set(this.data)
            const invite_emails = choose_member_form.emails
            const member_invite_code = crypto.randomUUID()
            const current_user_uid = user_auth.data ? user_auth.data.uid : ''

            const team_members = <TeamMembersData[]>[]
            const team_members_ids = <string[]>[]
            const member_invite = <InvitationData[]>[]
            const member_invite_ids = <string[]>[]
            for (const email of invite_emails) {
                const member_uuid = crypto.randomUUID()
                const invite_uuid = crypto.randomUUID()
                team_members_ids.push(member_uuid)
                team_members.push({
                    uid: '',
                    member_id: member_uuid,
                    accessPermissions: JSON.parse(JSON.stringify(default_access)),
                    isDisabled: true,
                    isPending: true,
                    role:TeamRole.MEMBER,
                    invitation: {
                        reference: invite_uuid,
                        email: email,
                        invitedBy: current_user_uid,
                    },
                    createdAt: '',
                    updatedAt: '',
                    subCollections: []
                })

                member_invite.push({
                    iv_id: invite_uuid,
                    type: 'Member Team Invite',
                    reference: {
                        collection: 'team_members',
                        path: `teams/${team_id}/team_members/${member_uuid}`,
                        id: member_uuid
                    },
                    teamReference: {
                        collection: 'teams',
                        path: `teams/${team_model.data.tm_id}`,
                        id: team_model.data.tm_id
                    },
                    isActive: true,
                    expiration: uiHelpers.generateExpirationDate(1800),
                    createdAt: '',
                    updatedAt: '',
                    subCollections: []
                })
                member_invite_ids.push(invite_uuid)

            }
            const add_members = await postCollectionBatch('team_members', 'teams/:tm_id/team_members', { tm_id: team_model.data.tm_id }, team_members_ids, team_members)
            const send_invites = await postCollectionBatch('invitation', 'invitations', null, member_invite_ids, member_invite)
            console.log(add_members)
            console.log(send_invites)
            if (this.data.team_members) this.data.team_members = [...this.data.team_members, ...team_members]
            await this.get_members()
            choose_member_form.emails = []

        }
        this.invite_load = false
    },
})

const selected_member = reactive({
    user_data: <UserData | null>null,
    member_info: <TeamMembersData | null>null,
    permission: '',
    role: <string>'',
    isDisabled: <boolean>false,
    invitation: <TeamInvitation | null>null,
    get_active_member(uid: string, isPending: boolean, member: TeamMembersData) {
        this.member_info = member
        this.permission = `${Object.keys(this.member_info.accessPermissions).length} permission/s`
        this.isDisabled = this.member_info.isDisabled
        if (uid && !isPending) {
            this.user_data = current_team.members_info[uid]
        } else {
            if (member.invitation) {
                this.user_data = user_data
                this.user_data.email = member.invitation.email
            }
        }

    },
    reset() {
        this.user_data = null
        this.member_info = null
    }
})

interface InviteMember {
    member_email: string,
}

const choose_member_form = reactive({
    emails: <string[]>[],
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

        if (field === 'member_email' && this.dataInput['member_email'] === user_auth.data?.email) {
            this.errors[field] = 'You cannot invite yourself'
            return false
        }

        if (this.emails.includes(this.dataInput['member_email'])) {
            this.errors[field] = 'This email is already on the invitation'
            return false
        }

        if (current_team.member_email_list.includes(this.dataInput['member_email'])) {
            this.errors[field] = 'This email is already part of the team'
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

async function fetch_validate_team() {
    current_team.get_current_team()
    if (!current_team.data) {
        await router.push({ name: 'teams' })
    }
    await current_team.get_members()

    pageLoad.value = false
}

async function copyLink(invi_id: string) {
    try {
        await navigator.clipboard.writeText(`http://localhost:5173/team-invite/${invi_id}`);
        toast({
            title: 'Invited link Copied',
            variant: 'default',
            duration: 2000
        })
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
}

onMounted(async () => {
    if (user_team_refs.isInitialized) {
        await fetch_validate_team()
    }
})

watch(() => user_team_refs.isInitialized, async (initlized) => {
    if (initlized) {
        await fetch_validate_team()
    }
    // Perform additional actions if needed when myData changes
});

</script>
<template>
    <Toaster />
    <div v-if="!pageLoad">
        <div v-if="current_team.data" class="space-y-4">
            <div class="flex items-center space-x-2">
                <Button variant="ghost" class="flex" @click="router.push({ name: 'teams' })"><i
                        class="material-icons text-md">arrow_back</i></Button>
                <span class="font-bold text-lg">{{ current_team.data.name }}</span>
            </div>
            <div class="grid grid-cols-12 gap-x-4">


                <div class="col-span-7 self-start space-y-4">
                    <div class="text-lg font-bold">Member list</div>
                    <div class="rounded-lg">

                        <div class="">
                            <div class="relative mx-auto w-full max-w-screen-md">
                                <span
                                    class="absolute inset-y-1 left-1 grid aspect-square place-content-center bg-white">
                                    <i class="bx bx-search" />
                                </span>
                                <Input type="search" placeholder="Search Members" class="ps-10" />
                            </div>
                        </div>
                        <div class="max-h-[70vh] overflow-y-scroll">
                            <div class="flex flex-col space-y-4 py-4">
                                <div v-for="member in current_team.data.team_members"
                                    class=" hover:bg-slate-100 rounded-lg transition-colors duration-100 cursor-pointer"
                                    @click="selected_member.get_active_member(member.uid, member.isPending, member)"
                                    :class="{ 'bg-slate-100': selected_member.member_info && selected_member.member_info.member_id === member.member_id }">
                                    <div v-if="!member.isPending && member.uid" class="flex items-center py-2 px-2">
                                        <div class="w-[50%] flex space-x-4 items-center">
                                            <Avatar>
                                                <AvatarImage src="" alt="@radix-vue" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div class="flex justify-between  items-center gap-8">
                                                <div class="flex-1 space-y-1 w-44">
                                                    <p class="text-sm font-medium leading-none">
                                                        {{ current_team.members_info[member.uid].displayName }}
                                                    </p>
                                                    <p class="text-xs text-muted-foreground">
                                                        {{ current_team.members_info[member.uid].email }}
                                                    </p>

                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-[30%]">
                                            <div class="text-sm">14 Permissions</div>
                                        </div>
                                        <div class="w-[20%]">
                                            <div class="text-sm">{{ member.uid === current_team.data.owner_uid ? 'Owner'
                                                : 'Member' }}</div>
                                        </div>
                                    </div>
                                    <div v-else-if="member.isPending && member.invitation"
                                        class="flex items-center py-2 px-2">
                                        <div class="w-[50%] flex space-x-4 items-center">
                                            <Avatar>
                                                <AvatarImage src="" alt="@radix-vue" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div class="flex justify-between  items-center gap-8">
                                                <div class="flex-1 space-y-1 w-44">
                                                    <p class="text-sm font-medium leading-none">
                                                        {{ member.invitation.email }}
                                                    </p>
                                                    <p class="text-xs leading-none">
                                                        (Pending)
                                                    </p>
                                                    <div>
                                                        <Button class="text-blue-500 p-0 text-sm" size="sm"
                                                            variant="ghost" @click="copyLink(member.invitation.reference)"><i
                                                                class="material-icons">link</i> Copy link</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-[30%]">
                                            <div class="text-sm">14 Permissions</div>
                                        </div>
                                        <div class="w-[20%]">
                                            <div class="text-sm">Member</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="col-span-5 self-start">
                    <div v-if="!selected_member.user_data" class="space-y-4">
                        <div class="text-lg font-bold">Settings</div>
                        <div class="border-2 rounded-lg py-5 px-4 bg-gray-100 border-gray-200 space-y-3">
                            <div class="flex flex-col">
                                <span class="font-semibold text-sm">Team Name:</span>
                                <div class="flex justify-between items-center">
                                    <span>{{ current_team.data.name }}</span>
                                    <Button variant="ghost"
                                        class="font-bold text-sm text-blue-500 hover:text-blue-700 p-0">Change
                                        name</Button>
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
                                    <Button class="text-blue-500 p-0 text-sm" size="sm" variant="ghost"
                                        @click="copyLink(current_team.data.inviteLink)"><i
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
                                <div
                                    class="max-h-[10vh]  overflow-y-scroll  p-4 py-2 flex flex-row flex-wrap gap-2 items-center">
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
                                    <Button :disabled="!choose_member_form.emails.length" class=" w-full rounded-t-non"
                                        @click="current_team.inviteMembers()" size="xs">Invite Users</Button>
                                </div>
                            </div>
                            <div v-if="choose_member_form.errors.member_email" for="name"
                                class="flex items-center gap-1 text-xs text-red-500">
                                <i class="material-icons text-sm">error</i>
                                {{ choose_member_form.errors.member_email }}
                            </div>
                        </div>
                    </div>
                    <div v-else-if="selected_member.user_data && selected_member.member_info" class="space-y-4">
                        <div class="flex justify-between items-center">
                            <div class="text-lg font-bold">Member Infoformation</div>
                            <Button variant="ghost" class="font-bold text-sm text-blue-500 hover:text-blue-700"
                                @click="selected_member.reset()">Settings</Button>
                        </div>
                        <div class="border-2 rounded-lg bg-gray-100 border-gray-200 py-3 px-4 space-y-3">

                            <div class="flex flex-col space-y-3">
                                <div class="flex space-x-4 items-center">
                                    <Avatar>
                                        <AvatarImage src="" alt="@radix-vue" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div v-if="!selected_member.member_info.isPending"
                                        class="flex justify-between  items-center gap-8">
                                        <div class="flex-1 space-y-1 w-44">
                                            <p class="text-sm font-medium leading-none">
                                                {{ selected_member.user_data.displayName }}
                                            </p>
                                            <p class="text-xs text-muted-foreground">
                                                {{ selected_member.user_data.email }}
                                            </p>
                                        </div>
                                    </div>
                                    <div v-else class="flex justify-between  items-center gap-8">
                                        <div class="flex-1 space-y-1 w-44">
                                            <p class="text-sm font-medium leading-none">
                                                {{ selected_member.member_info.invitation?.email }}
                                            </p>
                                            <p class="text-xs text-muted-foreground">
                                                (Pending)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col">
                                <span class="font-semibold text-sm">Role:</span>
                                <span class="text-md">{{ selected_member.user_data.uid === current_team.data.owner_uid ?
                                    'Owner' : 'Member' }}</span>
                            </div>

                            <div class="flex flex-col">
                                <span class="font-semibold text-sm">Permissions:</span>
                                <div>
                                    <span class="text-md text-blue-500 cursor-pointer font-semibold text-sm">{{
                                        selected_member.permission }}</span>
                                </div>
                            </div>

                            <div class="flex flex-col">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-sm">Revoke Access:</span>
                                    <Switch :checked="selected_member.isDisabled" />

                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-xs w-64 truncate">Temporarily Revoke user access</span>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-sm">Remove Member from Team:</span>
                                    <Button class="text-red-500 hover:text-red-700 p-0" size="sm"
                                        variant="ghost">Remove</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <!-- {{ current_team.data }} -->

    <div v-else>
        loadingg....
    </div>
</template>
<style scoped>
.page-container {
    /* This will apply only to this page */
    margin: 0;
    padding: 0;
}
</style>