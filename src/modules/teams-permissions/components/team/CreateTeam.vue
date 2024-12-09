<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Dialog from '@/core/components/ui/dialog/Dialog.vue'
import DialogContent from '@/core/components/ui/dialog/DialogContent.vue'
import DialogTitle from '@/core/components/ui/dialog/DialogTitle.vue'
import Input from '@/core/components/ui/input/Input.vue'
import { toast } from '@/core/components/ui/toast'
import Toaster from '@/core/components/ui/toast/Toaster.vue'
import type { InvitationData } from '@/core/types/InvitationTypes'
import { admin_access, default_access, default_access_general } from '@/core/types/PermissionTypes'
import { TeamRole, type TeamData, type TeamMembersData } from '@/core/types/TeamTypes'
import { postCollectionBatch, postCollectionBatchAtomic } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { useTeamStore } from '@/stores/teamStore'
import { useUserStore } from '@/stores/userStore'
import { VisuallyHidden } from 'radix-vue'
import { reactive, watch } from 'vue'
import { z, type ZodRawShape } from 'zod'

const teamStore = useTeamStore()
const authStore = useAuthStore()
const invitationStore = useInvitationStore()
const userStore = useUserStore()
const { user_auth } = authStore
const { team: team_model, team_members } = teamStore
const { setTeamReference } = userStore
const { createTeamInvite } = invitationStore

interface NewTeamInput {
  name: string
  member_email: string
}

type NewTeamCreate = Pick<NewTeamInput, 'name'>
type ChooseMemberFields = Pick<NewTeamInput, 'member_email'>
enum CreateTeamSteps {
  Name = 'NAME',
  Members = 'MEMBERS',
  Complete = 'COMPLETE',
}

const props = defineProps<{ open_modal: boolean }>()

const emit = defineEmits<{
  (e: 'return', value: TeamData | null): void
}>()

watch(
  () => props.open_modal,
  (newTrigger) => {
    console.log('test')
    if (newTrigger) {
      create_team_modal.isOpen = true
    }
  },
)

const team_name_form = reactive({
  dataInput: { name: '' } as NewTeamCreate,
  errors: { name: '' } as NewTeamCreate,
  schema: {
    name: z.string().min(1, { message: 'Team name is required' }),
  } as ZodRawShape,

  validateSingleField(field: keyof NewTeamCreate): void {
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
      const field = key as keyof NewTeamCreate
      this.errors[field] = ''
    })
    const result = z.object(this.schema as ZodRawShape).safeParse(this.dataInput)

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof NewTeamCreate
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
  },
})

const choose_member_form = reactive({
  emails: [] as string[],
  dataInput: { member_email: '' } as ChooseMemberFields,
  errors: { member_email: '' } as ChooseMemberFields,
  schema(input: ChooseMemberFields): ZodRawShape {
    return {
      member_email: z.union([
        z.literal(''),
        z.string().email(`${input.member_email} must be a valid email`),
      ]),
    }
  },
  validateSingleField(field: keyof ChooseMemberFields): boolean {
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
    return true
  },
  async validateDataInput(): Promise<boolean> {
    Object.keys(this.errors).forEach((key) => {
      const field = key as keyof ChooseMemberFields
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
    this.emails = []
  },
})

const create_team_modal = reactive({
  isOpen: false,
  isLoading: false,
  steps: CreateTeamSteps.Name as CreateTeamSteps,
  data: {
    name: '',
    invite_link: 'Sample linkkkk.......',
  },
  processing_msg: '',
  async continue() {
    if (this.steps === CreateTeamSteps.Name) {
      const validated = await team_name_form.validateDataInput()
      if (validated) {
        this.isLoading = true
        this.data.name = team_name_form.dataInput.name
        this.data.invite_link = crypto.randomUUID()
        const create_team = await this.createNewTeam()
        if (create_team) {
          this.steps = CreateTeamSteps.Members
        }
        this.isLoading = false
      }
    } else if (this.steps === CreateTeamSteps.Members) {
      const validated = await choose_member_form.validateDataInput()
      if (validated) {
        this.isLoading = true
        await this.inviteMembers()
        this.isLoading = false
        this.steps = CreateTeamSteps.Complete
        this.close()
      }
    }
  },
  close() {
    this.steps = CreateTeamSteps.Name
    this.data = {
      name: '',
      invite_link: '',
    }
    team_name_form.reset()
    choose_member_form.reset()
    this.isOpen = false
    emit('return', team_model.data)
  },
  async createNewTeam(): Promise<boolean> {
    if (user_auth.data) {
      //Create a new team
      team_model.reInit()
      console.log(team_model.data)

      
      team_model.data = {
        ...team_model.data,
        name: this.data.name,
        inviteLink: this.data.invite_link,
        owner_uid: user_auth.data.uid,
        
      }
      // team_model.data.name = this.data.name
      // team_model.data.inviteLink = this.data.invite_link
      // team_model.data.owner_uid = user_auth.data.uid

      const post = await team_model.createUpdate('new')
      if (post.status) {
        //Create an Invite Code
        team_model.set(post.data)
        await createTeamInvite(
          team_model.data,
          team_model.data.inviteLink,
          'Team Invite',
          `teams/${team_model.data.tm_id}`,
        )
        team_members.reInit()
        team_members.data.uid = user_auth.data.uid
        team_members.data.member_id = crypto.randomUUID()
        team_members.data.accessPermissions = JSON.parse(JSON.stringify(admin_access))
        team_members.data.isDisabled = true
        team_members.data.role = TeamRole.OWNER
        team_members.data.isPending = false
        await team_members.createUpdate(team_model.data.tm_id, 'new')
        //Create Reference
        await setTeamReference(team_model.data.tm_id, user_auth.data.uid)
        return true
      } else {
        //Toaster here when it's  a failure
        console.log('Something wentwrong')
        return false
      }
    }
    return false
  },
  async inviteMembers(): Promise<void> {
    //This should be called in the BACKEND!!!!
    /**
     * Create a unique invite code that will be sent to user
     * Make the member invite pending
     * If member access the link he/she will be referenced
     */
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
        generalPermissions: JSON.parse(JSON.stringify(default_access_general)),
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
          path: `teams/${team_model.data.tm_id}/team_members/${member_uuid}`,
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
    const add_members = await postCollectionBatchAtomic(
      'team_members',
      {
        $path:'teams/:tm_id/team_members',
        $sub_params:{
          tm_id: team_model.data.tm_id
        },
        ids:team_members_ids,
        data:team_members
      }
    )
    const send_invites = await postCollectionBatchAtomic(
      'invitation',
      {
        $path:'invitations',
      $sub_params:null,
      ids:member_invite_ids,
      data:member_invite
      }
    )
    console.log(add_members)
    console.log(send_invites)
  },
  /** 
    async inviteMembers(): Promise<void> {
        //This should be called in the BACKEND!!!!
        const invite_emails = choose_member_form.emails
        const non_existing_users = [...choose_member_form.emails]

        const users = await getWhereAny("user", "users", {}, [], [
            { fieldName: 'email', operator: "in", value: invite_emails }
        ])
        if (users.status && users.data.length) {
            for (const email of invite_emails) {
                const user = users.data.find(user => user.email === email)
                if (user) {
                    const index = non_existing_users.indexOf(user.email as string);
                    team_model.data.members.push({
                        uid: user.uid,
                        permission: ['read and write'],
                        isDisabled: false,
                        dateAdded: new Date().toISOString()
                    })
                    non_existing_users.splice(index, 1);
                }
            }
            console.log(team_model.data.members)
            await team_model.createUpdate('update')



            for (const member of team_model.data.members) {
                user_team_refs.reInit()
                user_team_refs.data.tm_id = team_model.data.tm_id
                const create_team_refs = await user_team_refs.createUpdate(member.uid, 'new')
                if (create_team_refs.status) {
                    console.log('success')
                } else {
                    console.log(create_team_refs.error)
                }
            }

        }
        non_existing_users.forEach(email => {
            this.sendEmailInvite(email)
        })

    },
    */
  async sendEmailInvite() {
    console.log('email sent')
  },
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(
      `www.mmiov3/team/invite?link=${create_team_modal.data.invite_link}`,
    )
    toast({
      title: 'Invited link Copied',
      variant: 'default',
      duration: 2000,
    })
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

//When you use an invite link you'll be automatically added to the team
//When you invite someone in email it is not automatically added. Instead it will send another invite link to the email
</script>
<template>
  <Toaster />
  <Dialog v-model:open="create_team_modal.isOpen">
    <DialogContent @interact-outside="(e) => e.preventDefault()" class="min-h-[75%] sm:max-w-[75%]">
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <div>
        <div class="flex justify-end">
          <div>
            <button
              v-if="!create_team_modal.isLoading"
              class="right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
              @click="create_team_modal.close()"
            >
              <i class="material-icons">close</i>
            </button>
          </div>
        </div>
        <!-- This part is changing -->
        <div v-if="create_team_modal.steps === CreateTeamSteps.Name" class="container mx-auto">
          <div class="grid grid-cols-1 gap-5">
            <div class="col-span-1">
              <div class="flex flex-col items-center justify-center space-y-2">
                <img
                  src="@/assets/undraw_team_spirit_re_yl1v.svg"
                  alt="Centered SVG"
                  class="h-[20vh] w-[20vh]"
                />
              </div>
            </div>
            <div class="col-span-1">
              <div class="flex flex-col items-center justify-center gap-y-4">
                <div>
                  <span class="font-bold text-gray-600">1 of 2</span>
                </div>
                <div
                  class="text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-5xl font-bold text-transparent"
                >
                  Let's create you a Team
                </div>
                <div>
                  <span class="font-semibold">You can always change this later from settings</span>
                </div>

                <div class="flex flex-col items-center space-y-2 pt-5">
                  <Input
                    v-model="team_name_form.dataInput.name"
                    :disabled="create_team_modal.isLoading"
                    @blur="team_name_form.validateSingleField('name')"
                    type="text"
                    placeholder="Team Name"
                    class="w-[50vh] rounded-none border-x-0 border-b-2 border-t-0 text-center text-4xl font-thin focus-visible:border-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div
                    v-if="team_name_form.errors.name"
                    for="name"
                    class="flex items-center gap-1 text-xs text-red-500"
                  >
                    <i class="material-icons text-sm">error</i>
                    {{ team_name_form.errors.name }}
                  </div>
                </div>
                <div>
                  <Button
                    v-if="!create_team_modal.isLoading"
                    @click="create_team_modal.continue()"
                    class="bg-red-500 px-10 text-white hover:bg-red-700"
                    size="sm"
                    >Create Team</Button
                  >
                  <Button
                    v-else
                    variant="outline"
                    size="xs"
                    disabled
                    class="flex items-center gap-2"
                  >
                    <i class="material-icons animate-spin text-sm">donut_large</i>Creating you a
                    team...
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="create_team_modal.steps === CreateTeamSteps.Members" class="container mx-auto">
          <div class="grid grid-cols-1 gap-5">
            <div class="col-span-1">
              <div class="flex flex-col items-center justify-center space-y-2">
                <img
                  src="@/assets/undraw_team_spirit_re_yl1v.svg"
                  alt="Centered SVG"
                  class="h-[20vh] w-[20vh]"
                />
              </div>
            </div>
            <div class="col-span-1">
              <div class="flex flex-col items-center justify-center gap-y-4">
                <div>
                  <span class="font-bold text-gray-600">2 of 2</span>
                </div>
                <div
                  class="text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-5xl font-bold text-transparent"
                >
                  Who do you want to work with?
                </div>
                <div>
                  <span class="font-semibold">You can always change this later from settings</span>
                </div>

                <div class="flex flex-col items-center space-y-2 pt-5">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span>Invite up to 40 teammates: </span>
                      <Button
                        v-if="!create_team_modal.isLoading"
                        class="text-blue-500"
                        size="sm"
                        variant="ghost"
                        @click="copyLink()"
                      >
                        <i class="material-icons pr-2">link</i>
                        Copy link</Button
                      >
                    </div>
                    <div
                      class="flex w-[70vh] flex-row flex-wrap items-center gap-2 rounded-lg border-2 p-4"
                    >
                      <div
                        v-for="(email, index) in choose_member_form.emails"
                        :key="email"
                        class="flex items-center space-x-2 self-start rounded-full bg-blue-500 p-2 px-3"
                      >
                        <span class="text-sm font-semibold text-white">{{ email }}</span>
                        <button
                          @click="choose_member_form.removeEmail(index)"
                          class="flex cursor-pointer items-center text-white focus:outline-none"
                        >
                          <i class="material-icons text-md">close</i>
                        </button>
                      </div>

                      <div class="w-[30vh] rounded-full">
                        <Input
                          v-model="choose_member_form.dataInput.member_email"
                          :disabled="create_team_modal.isLoading"
                          @blur="choose_member_form.addEmail()"
                          @keyup.enter="choose_member_form.addEmail()"
                          type="text"
                          placeholder="User Email"
                          class="rounded-none border-x-0 border-b border-t-0 text-sm focus-visible:border-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
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
                <div class="flex items-center justify-between gap-x-2">
                  <Button
                    v-if="!create_team_modal.isLoading"
                    @click="create_team_modal.continue()"
                    class="px-10 text-red-500 hover:text-red-700"
                    size="sm"
                    variant="ghost"
                    >Invite later</Button
                  >
                  <Button
                    v-if="!create_team_modal.isLoading"
                    @click="create_team_modal.continue()"
                    class="bg-red-500 px-10 text-white hover:bg-red-700"
                    size="sm"
                    >Invite Users</Button
                  >
                  <Button
                    v-if="create_team_modal.isLoading"
                    variant="outline"
                    size="xs"
                    disabled
                    class="flex items-center gap-2"
                  >
                    <i class="material-icons animate-spin text-sm">donut_large</i>Creating you a
                    team...
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="create_team_modal.steps === CreateTeamSteps.Complete"
          class="container mx-auto pt-10"
        >
          <div class="grid grid-cols-1 gap-5">
            <div class="col-span-1">
              <div class="flex items-center justify-center">
                <div
                  class="text bg-gradient-to-r from-[#FB1A1E] to-[#B25FEE] bg-clip-text text-5xl font-bold text-transparent"
                >
                  You have successfuly created a team!
                </div>
              </div>
            </div>
            <div class="col-span-1 pt-20">
              <div class="flex flex-col items-center justify-center space-y-2">
                <img
                  src="@/assets/undraw_vintage_414k.svg"
                  alt="Centered SVG"
                  class="h-[25vh] w-[25vh]"
                />
                <div class="flex items-center gap-x-2">
                  <i class="material-icons text-md animate-spin">donut_large</i>
                  <span class="text-md font-semibold"
                    >Please wait while we redirect you to your team workspace</span
                  >
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
