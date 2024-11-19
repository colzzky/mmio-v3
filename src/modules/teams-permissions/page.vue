<script lang="ts" setup>
import TeamsPermissionsLayout from '@/core/layouts/TeamsPermissions.vue';
import TeamView from './views/team-view.vue';
import Teams from './views/teams.vue';
import Permissions from './views/permissions.vue';
import PermissionView from './views/permission-view.vue';
import { onMounted} from 'vue'
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
const route = useRoute();
const authStore = useAuthStore()
const { user_auth, user, user_team_refs, fetch_team_list } = authStore

onMounted(async () => {
  if (!user_team_refs.isInitialized) {
    await fetch_team_list()
  }
})
</script>
<template>
    <TeamsPermissionsLayout>
        <div v-if="route.name === 'team-permission' || route.name === 'teams'">
            <Teams/>
        </div>
        <div v-else-if="route.name === 'team-view'">
            <TeamView />
        </div>
        <div v-else-if="route.name === 'permissions'">
            <Permissions />
        </div>
        <div v-else-if="route.name === 'permission-view'">
            <PermissionView />
        </div>
    </TeamsPermissionsLayout>
</template>
