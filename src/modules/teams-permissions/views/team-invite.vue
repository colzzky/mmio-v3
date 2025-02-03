<script lang="ts" setup>
import { default_access } from '@/core/types/PermissionTypes'
import { type TeamMembersData } from '@/core/types/TeamTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { getCollection, getWhereAny, postCollection } from '@/core/utils/firebase-collections'
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
  // Check also the status
  const get_invite = await getCollection(DbCollections.invitations,{
    id:invitation_id,
  })

  // Check if invitation fetch from firestore exist
  if (!get_invite.status || !get_invite.data) {
    console.log('Invite link not valid')
    return
  }

  // Check if the invitation type is 'Team Invite'
  if (get_invite.data.type !== 'Team Invite') {
    console.log('Invite type is not for a team')
    return
  }

  // Check if the user is already part of the team
  const part_of_team = check_team_part(get_invite.data.reference.id)
  if (part_of_team) {
    console.log('You are already part of the team')
    return
  }

  // Accept the invitation if the user is not part of the team
  const accept_invitation = await accept_invite(get_invite.data.reference.id)
  if (accept_invitation) {
    console.log('Invite accepted, redirecting to home page')
  } else {
    console.log('Error with the invite')
  }
}

function check_team_part(team_id: string) {
  if (user.data && user.references && user.references.user_team_refs) {
    if (user.references.user_team_refs.find((team) => team.tm_id === team_id)) {
      return true
    }
  }
  return false
}

async function accept_invite(team_id: string) {
  let member_exist: TeamMembersData | null = null
  let type: 'new' | 'update' = 'new'
  if (user_auth.data) {
    //Check if the user already exist first
    const member = await getWhereAny(DbCollections.team_members, {
      $sub_params: { tm_id: team_id },
      whereConditions: [
        {
          fieldName: 'invitation.email',
          operator: '==',
          value: user_auth.data.email,
        },
      ],
    })

    if (member.status && member.data[0]) {
      member_exist = member.data[0]
    }

    if (member_exist) {
      team_members.set(member_exist)
      type = 'update'
    } else {
      team_members.reInit()
      type = 'new'
    }

    team_members.data = {
      ...team_members.data,
      uid: user_auth.data.uid,
      isPending: false,
      isDisabled: false,
      accessPermissions: JSON.parse(JSON.stringify(default_access)),
    }

    //Add member function
    const validate_add = await addMember(team_id, type)
    //Create Team Reference function
    const validate_reference = await setTeamReference(team_id, user_auth.data.uid)
    if (validate_add && validate_reference) return true
  }
  return false
}

async function addMember(team_id: string, type: 'new' | 'update') {
  const invite_member = await postCollection(DbCollections.team_members,
    {
      data:team_members.data,
      idKey:'member_id',
      $sub_params:{tm_id:team_id}
    }
  )
  if (invite_member.status) {
    team_members.reInit()
    return true
  } else {
    false
  }
}
</script>
<template>
  <div>Accepting invite please wait</div>
</template>
