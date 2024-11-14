<script lang="ts" setup>
// import type { TeamData } from '@/core/types/TeamTypes';
// import { postCollection } from '@/core/utils/firebase-collections';
// import { useAuthStore } from '@/stores/authStore';
// import { useInvitationStore } from '@/stores/invitationStore';
// import { useTeamStore } from '@/stores/teamStore';
// import { onMounted } from 'vue';
// import { useRoute } from 'vue-router';
// const routes = useRoute()
// const teamStore = useTeamStore()
// const authStore = useAuthStore()
// const invitationStore = useInvitationStore()
// const { user_auth, user, user_team_refs } = authStore
// const { team:team_model } = teamStore
// const { invitation } = invitationStore

// onMounted(async()=>{
//     const invitation_id = routes.params.invi_id as string
//     if(invitation_id && user_auth.data){
//         const invite = await invitation.get(invitation_id)
//         if(invite.status){
//             invitation.set(invite.data)
//         }
//     }  
// })

// async function accept_invite(){
//     const team = <Pick<TeamData,'members'>>{
//         members:
//     }

//     postCollection('team','teams',{},invitation.data.reference.id,)
//     if(team.status){
//         team_model.set(team.data)
//         team.data.
//         team_model.reInit()
//         return true
//     }
//     return false
// }

</script>
<template>
    <div>Hi</div>
</template>