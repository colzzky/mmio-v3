<script lang="ts" setup>
import MemberPermission from '../components/team/memberPermission.vue'
import Avatar from '@/core/components/ui/avatar/Avatar.vue'
import AvatarFallback from '@/core/components/ui/avatar/AvatarFallback.vue'
import AvatarImage from '@/core/components/ui/avatar/AvatarImage.vue'
import Button from '@/core/components/ui/button/Button.vue'
import Input from '@/core/components/ui/input/Input.vue'
import Select from '@/core/components/ui/select/Select.vue'
import SelectContent from '@/core/components/ui/select/SelectContent.vue'
import SelectGroup from '@/core/components/ui/select/SelectGroup.vue'
import SelectItem from '@/core/components/ui/select/SelectItem.vue'
import SelectLabel from '@/core/components/ui/select/SelectLabel.vue'
import SelectTrigger from '@/core/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/core/components/ui/select/SelectValue.vue'
import Switch from '@/core/components/ui/switch/Switch.vue'
import { toast } from '@/core/components/ui/toast'
import Toaster from '@/core/components/ui/toast/Toaster.vue'
import { user_data, type UserData } from '@/core/types/AuthUserTypes'
import type { InvitationData } from '@/core/types/InvitationTypes'
import { default_access, default_access_general } from '@/core/types/PermissionTypes'
import { TeamRole, type TeamData, type TeamMembersData } from '@/core/types/TeamTypes'
import { getWhereAny, postCollectionBatch } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { useTeamStore } from '@/stores/teamStore'
import { reactive } from 'vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { z, type ZodRawShape } from 'zod'

const route = useRoute()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const { user_auth, user_team_refs } = authStore
const { team: team_model, team_members } = teamStore
const team_role = Object.values(TeamRole).filter((role) => role !== TeamRole.OWNER)

const team_id = route.params.team_id
const pageLoad = ref<boolean>(true)

const current_team = reactive({
  data: null as TeamData | null,
  members_info: {} as { [key: string]: UserData },
  invite_load: false as boolean,
  member_email_list: [] as string[],
  get_current_team() {
    const team = user_team_refs.data.find((team) => team.tm_id === team_id)
    if (team) {
      this.data = team
    }
    console.log(this.data)
  },
  async get_members() {
    if (this.data && this.data.team_members) {
      const non_pending_members = [] as string[]
      this.data.team_members.forEach((member) => {
        if (member.uid) {
          non_pending_members.push(member.uid)
        }
        if (member.invitation) {
          this.member_email_list.push(member.invitation.email)
        }
      })
      const members = await getWhereAny('user', {
        $path: 'users',
        whereConditions: [
          {
            fieldName: 'uid',
            operator: 'in',
            value: non_pending_members,
          },
        ],
      })

      if (members.status) {
        members.data.forEach((member) => {
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
      const current_user_uid = user_auth.data ? user_auth.data.uid : ''

      const team_members: TeamMembersData[] = []
      const team_members_ids: string[] = []
      const member_invite: InvitationData[] = []
      const member_invite_ids: string[] = []
      for (const email of invite_emails) {
        const member_uuid = crypto.randomUUID()
        const invite_uuid = crypto.randomUUID()
        team_members_ids.push(member_uuid)
        team_members.push({
          uid: '',
          member_id: member_uuid,
          accessPermissions: JSON.parse(JSON.stringify(default_access)),
          generalPermissions:JSON.parse(JSON.stringify(default_access_general)),
          isDisabled: true,
          isPending: true,
          role: TeamRole.MEMBER,
          invitation: {
            reference: invite_uuid,
            email: email,
            invitedBy: current_user_uid,
          },
          createdAt: '',
          updatedAt: '',
          subCollections: [],
        })

        member_invite.push({
          iv_id: invite_uuid,
          type: 'Member Team Invite',
          reference: {
            collection: 'team_members',
            path: `teams/${team_id}/team_members/${member_uuid}`,
            id: member_uuid,
          },
          teamReference: {
            collection: 'teams',
            path: `teams/${team_model.data.tm_id}`,
            id: team_model.data.tm_id,
          },
          isActive: true,
          expiration: uiHelpers.generateExpirationDate(1800),
          createdAt: '',
          updatedAt: '',
          subCollections: [],
        })
        member_invite_ids.push(invite_uuid)
      }
      const add_members = await postCollectionBatch(
        'team_members',
        'teams/:tm_id/team_members',
        { tm_id: team_model.data.tm_id },
        team_members_ids,
        team_members,
      )
      const send_invites = await postCollectionBatch(
        'invitation',
        'invitations',
        null,
        member_invite_ids,
        member_invite,
      )
      console.log(add_members)
      console.log(send_invites)
      if (this.data.team_members)
        this.data.team_members = [...this.data.team_members, ...team_members]
      await this.get_members()
      choose_member_form.emails = []
    }
    this.invite_load = false
  },
})

const selected_member = reactive({
  user_data: null as UserData | null,
  member_info: null as TeamMembersData | null,
  change_role_load: false as boolean,
  set_active_member(uid: string, isPending: boolean, member: TeamMembersData) {
    console.log(member)
    this.member_info = member
    if (uid && !isPending) {
      this.user_data = current_team.members_info[uid]
    } else {
      if (member.invitation) {
        this.user_data = user_data
        this.user_data.email = member.invitation.email
      }
    }
  },
  async change_role() {
    this.change_role_load = true
    console.log(this.member_info?.role)
    await this.save_update()
    this.change_role_load = false
  },

  async save_update() {
    if (this.member_info && current_team.data && current_team.data.team_members) {
      team_members.reInit()
      team_members.set(this.member_info)
      const update_member = await team_members.createUpdate(team_id as string, 'update')
      if (update_member.status) {
        this.member_info = update_member.data
        const team_member_index = current_team.data.team_members.findIndex(
          (member) => member.member_id === update_member.data.member_id,
        )
        current_team.data.team_members[team_member_index] = update_member.data
      }
    }
  },
  reset() {
    this.user_data = null
    this.member_info = null
  },
})

interface InviteMember {
  member_email: string
}

const choose_member_form = reactive({
  emails: [] as string[],
  dataInput: { member_email: '' } as InviteMember,
  errors: { member_email: '' } as InviteMember,
  schema(input: InviteMember): ZodRawShape {
    return {
      member_email: z.union([
        z.literal(''),
        z.string().email(`${input.member_email} must be a valid email`),
      ]),
    }
  },
  validateSingleField(field: keyof InviteMember): boolean {
    const value = this.dataInput[field]
    this.errors[field] = ''
    const result = z
      .object(this.schema(this.dataInput) as ZodRawShape)
      .shape[field].safeParse(value)

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

    const invalid = this.emails.some((email) => {
      const checker = z
        .object(this.schema({ member_email: email }) as ZodRawShape)
        .safeParse({ member_email: email })
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
  },
})

async function fetch_validate_team() {
  current_team.get_current_team()
  if (!current_team.data) {
    await router.push({ name: 'teams' })
  }
  await current_team.get_members()

  pageLoad.value = false
}

async function copyLink(type: 'member' | 'team', invi_id: string) {
  try {
    if (type === 'member')
      await navigator.clipboard.writeText(`http://localhost:5173/member-invite/${invi_id}`)
    await navigator.clipboard.writeText(`http://localhost:5173/team-invite/${invi_id}`)
    toast({
      title: 'Invited link Copied',
      variant: 'default',
      duration: 2000,
    })
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

onMounted(async () => {
  if (user_team_refs.isInitialized) {
    await fetch_validate_team()
  }
})

watch(
  () => user_team_refs.isInitialized,
  async (initlized) => {
    if (initlized) {
      await fetch_validate_team()
    }
    // Perform additional actions if needed when myData changes
  },
)

const member_permission_modal = ref(false)
async function member_permission_modal_return(member_data: TeamMembersData | null) {
  member_permission_modal.value = false
  if (member_data && current_team.data && current_team.data.team_members) {
    selected_member.member_info = member_data
    const member_index = current_team.data.team_members.findIndex(
      (member) => member.member_id === member_data.member_id,
    )
    if (member_index >= 0) {
      current_team.data.team_members[member_index] = member_data
      toast({
        title: 'Permission successfully updated',
        variant: 'success',
        duration: 2000,
      })
    }
  }
}
</script>
<template>
  <Toaster />
  <div v-if="!pageLoad">
    <div v-if="current_team.data" class="space-y-4">
      <div class="flex items-center space-x-2">
        <Button variant="ghost" class="flex" @click="router.push({ name: 'teams' })"
          ><i class="material-icons text-md">arrow_back</i></Button
        >
        <span class="text-lg font-bold">{{ current_team.data.name }}</span>
      </div>
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-7 space-y-4 self-start">
          <div class="text-lg font-bold">Member list</div>
          <div class="rounded-lg">
            <div class="">
              <div class="relative mx-auto w-full max-w-screen-md">
                <span
                  class="absolute inset-y-1 left-1 grid aspect-square place-content-center bg-white"
                >
                  <i class="bx bx-search" />
                </span>
                <Input type="search" placeholder="Search Members" class="ps-10" />
              </div>
            </div>
            <div class="max-h-[70vh] overflow-y-scroll">
              <div class="flex flex-col space-y-4 py-4">
                <div
                  v-for="member in current_team.data.team_members"
                  :key="member.member_id"
                  class="cursor-pointer rounded-lg transition-colors duration-100 hover:bg-slate-100"
                  @click="selected_member.set_active_member(member.uid, member.isPending, member)"
                  :class="{
                    'bg-slate-100':
                      selected_member.member_info &&
                      selected_member.member_info.member_id === member.member_id,
                  }"
                >
                  <div v-if="!member.isPending && member.uid" class="flex items-center px-2 py-2">
                    <div class="flex w-[50%] items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="" alt="@radix-vue" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div class="flex items-center justify-between gap-8">
                        <div class="w-44 flex-1 space-y-1">
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
                      <div class="text-sm">
                        {{ member.accessPermissions ? Object.keys(member.accessPermissions).length : 0 }} Permissions
                      </div>
                    </div>
                    <div class="w-[20%]">
                      <div class="text-sm">{{ member.role }}</div>
                    </div>
                  </div>
                  <div
                    v-else-if="member.isPending && member.invitation"
                    class="flex items-center px-2 py-2"
                  >
                    <div class="flex w-[50%] items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="" alt="@radix-vue" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div class="flex items-center justify-between gap-8">
                        <div class="w-44 flex-1 space-y-1">
                          <p class="text-sm font-medium leading-none">
                            {{ member.invitation.email }}
                          </p>
                          <p class="text-xs leading-none">(Pending)</p>
                          <div>
                            <Button
                              class="p-0 text-sm text-blue-500"
                              size="sm"
                              variant="ghost"
                              @click="copyLink('member', member.invitation.reference)"
                              ><i class="material-icons">link</i> Copy link</Button
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="w-[30%]">
                      <div class="text-sm">
                        {{ Object.keys(member.accessPermissions).length }} Permissions
                      </div>
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
            <div class="space-y-3 rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-5">
              <div class="flex flex-col">
                <span class="text-sm font-semibold">Team Name:</span>
                <div class="flex items-center justify-between">
                  <span>{{ current_team.data.name }}</span>
                  <Button
                    variant="ghost"
                    class="p-0 text-sm font-bold text-blue-500 hover:text-blue-700"
                    >Change name</Button
                  >
                </div>
              </div>

              <div class="flex flex-col">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold">Activate Invite Link:</span>
                  <Switch />
                </div>
                <div class="flex items-center justify-between">
                  <span class="w-64 truncate text-xs"
                    >www.mmiv3.com/invite/{{ current_team.data.inviteLink }}</span
                  >
                  <Button
                    class="p-0 text-sm text-blue-500"
                    size="sm"
                    variant="ghost"
                    @click="copyLink('team', current_team.data.inviteLink)"
                    ><i class="material-icons">link</i> Copy link</Button
                  >
                </div>
                <div class="flex h-14 flex-col justify-end">
                  <div class="flex items-center justify-between">
                    <Button class="p-0 text-red-500 hover:text-red-700" size="sm" variant="ghost"
                      >Disassemble team</Button
                    >
                    <Button class="text-xs" size="xs" variant="destructive"
                      ><i class="material-icons mr-2 text-sm">exit_to_app</i>Leave Team</Button
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-lg font-bold">Invite Users</div>
              <div class="rounded-lg border-2">
                <div
                  class="flex max-h-[10vh] flex-row flex-wrap items-center gap-2 overflow-y-scroll p-4 py-2"
                >
                  <div
                    v-for="(email, index) in choose_member_form.emails"
                    :id="email"
                    :key="index"
                    class="flex items-center space-x-2 self-start rounded-full bg-blue-500 p-2 px-3"
                  >
                    <span class="text-xs font-semibold text-white">{{ email }}</span>
                    <button
                      @click="choose_member_form.removeEmail(index)"
                      class="flex cursor-pointer items-center text-white focus:outline-none"
                    >
                      <i class="material-icons text-sm">close</i>
                    </button>
                  </div>

                  <div class="rounded-full">
                    <Input
                      v-model="choose_member_form.dataInput.member_email"
                      @blur="choose_member_form.addEmail()"
                      @keyup.enter="choose_member_form.addEmail()"
                      type="text"
                      placeholder="User Email"
                      class="rounded-none border-x-0 border-b border-t-0 text-sm focus-visible:border-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                <div class="w-full">
                  <Button
                    :disabled="!choose_member_form.emails.length"
                    class="rounded-t-non w-full"
                    @click="current_team.inviteMembers()"
                    size="xs"
                    >Invite Users</Button
                  >
                </div>
              </div>
              <div
                v-if="choose_member_form.errors.member_email"
                for="name"
                class="flex items-center gap-1 text-xs text-red-500"
              >
                <i class="material-icons text-sm">error</i>
                {{ choose_member_form.errors.member_email }}
              </div>
            </div>
          </div>
          <div
            v-else-if="selected_member.user_data && selected_member.member_info"
            class="space-y-4"
          >
            <div class="flex items-center justify-between">
              <div class="text-lg font-bold">Member Infoformation</div>
              <Button
                variant="ghost"
                class="text-sm font-bold text-blue-500 hover:text-blue-700"
                @click="selected_member.reset()"
                >Settings</Button
              >
            </div>
            <div class="space-y-3 rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-3">
              <div class="flex flex-col space-y-3">
                <div class="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="" alt="@radix-vue" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div
                    v-if="!selected_member.member_info.isPending"
                    class="flex items-center justify-between gap-8"
                  >
                    <div class="w-44 flex-1 space-y-1">
                      <p class="text-sm font-medium leading-none">
                        {{ selected_member.user_data.displayName }}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {{ selected_member.user_data.email }}
                      </p>
                    </div>
                  </div>
                  <div v-else class="flex items-center justify-between gap-8">
                    <div class="w-44 flex-1 space-y-1">
                      <p class="text-sm font-medium leading-none">
                        {{ selected_member.member_info.invitation?.email }}
                      </p>
                      <p class="text-xs text-muted-foreground">(Pending)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="selected_member.member_info.role !== TeamRole.OWNER"
                class="flex items-center justify-between"
              >
                <span class="text-sm font-semibold">Role:</span>
                <Select
                  v-if="!selected_member.change_role_load"
                  v-model="selected_member.member_info.role"
                  @update:model-value="selected_member.change_role()"
                >
                  <SelectTrigger class="h-[3vh] w-[180px]">
                    <SelectValue :placeholder="selected_member.member_info.role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{{ selected_member.member_info.role }}</SelectLabel>
                      <SelectItem v-for="(role, index) in team_role" :key="index" :value="role">
                        {{ role }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button v-else variant="outline" size="xs" disabled class="flex items-center gap-2">
                  <i class="material-icons animate-spin text-sm">donut_large</i>Changing role
                </Button>
              </div>

              <div v-else class="flex items-center justify-between">
                <span class="text-sm font-semibold">Role:</span>
                <span class="text-sm font-semibold">Owner</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold">Permissions:</span>
                <div>
                  <span
                    @click="member_permission_modal = !member_permission_modal"
                    class="text-md cursor-pointer text-sm font-semibold text-blue-500"
                  >
                    {{
                      `${selected_member.member_info.accessPermissions ? Object.keys(selected_member.member_info.accessPermissions).length : 0}
                    Permissions`
                    }}</span
                  >
                </div>
              </div>

              <div class="flex flex-col">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold">Revoke Access:</span>
                  <Switch :checked="selected_member.member_info.isDisabled" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="w-64 truncate text-xs">Temporarily Revoke user access</span>
                </div>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold">Remove Member from Team:</span>
                  <Button class="p-0 text-red-500 hover:text-red-700" size="sm" variant="ghost"
                    >Remove</Button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- {{ current_team.data }} -->

  <div v-else>loadingg....</div>

  <MemberPermission
    :open_modal="member_permission_modal"
    :team_id="team_id as string"
    :member="selected_member.member_info"
    :member_name="selected_member.user_data ? selected_member.user_data.displayName : ''"
    @return="member_permission_modal_return"
  />
</template>
<style scoped>
.page-container {
  /* This will apply only to this page */
  margin: 0;
  padding: 0;
}
</style>
