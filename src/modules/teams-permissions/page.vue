<script lang="ts" setup>
import TeamsPermissionsLayout from '@/core/layouts/TeamsPermissions.vue';
import TeamView from './views/team-view.vue';
import Teams from './views/teams.vue';
import { onMounted} from 'vue'
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
const route = useRoute();
const authStore = useAuthStore()
const { user_auth, user, user_team_refs, fetch_team_list } = authStore

onMounted(async () => {
    if(!user_team_refs.isInitialized){
        await fetch_team_list()
    }
})

</script>
<template>
    <TeamsPermissionsLayout>
        <div v-if="route.path === 'team-permission' || route.name === 'teams'">
            <Teams/>
        </div>
        <div v-else-if="route.name === 'team-view'">
            <TeamView />
        </div>
    </TeamsPermissionsLayout>
</template>
