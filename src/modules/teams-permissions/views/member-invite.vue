<script lang="ts" setup>
import type { InvitationData } from '@/core/types/InvitationTypes'
import { default_access } from '@/core/types/PermissionTypes'
import { type TeamMembersData } from '@/core/types/TeamTypes'
import { getExact } from '@/core/utils/firebase-collections'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { useTeamStore } from '@/stores/teamStore'
import { useUserStore } from '@/stores/userStore'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const routes = useRoute()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const invitationStore = useInvitationStore()
const { user_auth, user } = authStore
const { team_members } = teamStore
const { invitation } = invitationStore
const { setTeamReference } = userStore

onMounted(async () => {
  await handleInvitation()
})

async function handleInvitation() {
  const invitation_id = routes.params.invi_id as string

  // Check if invitation ID and user authentication are valid
  if (!invitation_id || !user_auth.data) {
    console.log('Invite link not valid')
    return
  }

  // Get the invitation details
  const get_invite = await invitation.get(invitation_id)

  // Check if invitation fetch from firestore exist
  if (!get_invite.status || !get_invite.data.teamReference) {
    console.log('Invite link not valid')
    return
  }

  // Check if the invitation type is 'Team Invite'
  if (get_invite.data.type !== 'Member Team Invite') {
    console.log('Invite type is not for a team')
    return
  }

  // Check if the user is already part of the team
  if (!get_invite.data.teamReference) {
    console.log('Invalid Team Invite')
    return
  }

  const part_of_team = check_team_part(get_invite.data.teamReference.id)
  if (part_of_team) {
    console.log('You are already part of this team')
    return
  }

  // Accept the invitation if the user is not part of the team
  const accept_invitation = await accept_invite(get_invite.data, get_invite.data.teamReference.id)
  if (accept_invitation) {
    console.log('Invite accepted, redirecting to home page')
  } else {
    console.log('Error with the invite')
  }
}

function check_team_part(team_id: string) {
  if (user.data && user.data.team_refs && team_id) {
    if (user.data.team_refs.find((team) => team.tm_id === team_id)) {
      return true
    }
  }
  return false
}

async function accept_invite(invitation: InvitationData, team_id: string) {
  let member_exist = null as TeamMembersData | null
  let type: 'new' | 'update' = 'new'
  const team_reference = invitation.teamReference
  if (user_auth.data && team_reference) {
    //Check if the user already exist first

    const member = await getExact('team_members', {
      $path:'${invitation.reference.path}',
      $sub_col:[]
    })
    if (member.status && member.data && member.data.invitation) {
      //Validate if the invitation email matched with the user who is currently logged on
      const validate_email_user = member.data.invitation.email === user_auth.data.email
      if (!validate_email_user) return false
      member_exist = member.data
    }

    if (member_exist) {
      team_members.set(member_exist)
      type = 'update'
      team_members.data = {
        ...team_members.data,
        uid: user_auth.data.uid,
        isPending: false,
        isDisabled: false,
        accessPermissions: JSON.parse(JSON.stringify(default_access)),
      }

      const validate_update = await team_members.createUpdate(team_id, type)

      //Create Team Reference function
      const validate_reference = await setTeamReference(team_reference.id, user_auth.data.uid)
      if (validate_reference && validate_update) return true
    }
  }
  return false
}
</script>
<template>
  <div>Accepting Member Invite please wait</div>
</template>
