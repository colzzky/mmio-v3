<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue';
import type { UserData } from '@/core/types/AuthUserTypes';
import { getWhereAny } from '@/core/utils/firebase-collections';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import CreateTeam from '@/views/components/CreateTeam.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router';

const teamStore = useTeamStore()
const authStore = useAuthStore()
const { user_auth, user, user_team_refs } = authStore
const { team } = teamStore
const route = useRoute();
const pageLoad = ref<boolean>(true);

const new_team_modal = ref(false)
function new_team_return() {
    new_team_modal.value = false
}

const team_owners_uid: string[] = []
const team_owners = ref<{ [key: string]: UserData }>({})

async function fetch_owners() {
    pageLoad.value = true
    user_team_refs.data.forEach(team => {
        if (!team_owners_uid.includes(team.owner_uid)) {
            team_owners_uid.push(team.owner_uid)
        }
    })
    const fetch_owners = await getWhereAny('user', 'users', {}, [], [{
        fieldName: 'uid', operator: 'in', value: team_owners_uid
    }])

    console.log(fetch_owners)

    if (fetch_owners.status) {
        fetch_owners.data.forEach((data) => {
            team_owners.value[data.uid] = data;
        });
    }
    pageLoad.value = false
}

onMounted(async () => {
    if (user_team_refs.isInitialized) {
        console.log(user_team_refs.data)
        await fetch_owners()
    }
})


watch(() => user_team_refs.isInitialized, async (initlized) => {
    console.log('watching')
    if (initlized) {
        await fetch_owners()
    }
    // Perform additional actions if needed when myData changes
});

</script>

<template>
    <div>
        <div class="flex items-center justify-between">
            <div class="text-lg font-bold">Your Teams</div>
            <Button @click="new_team_modal = !new_team_modal" variant="ghost" class="font-bold text-blue-500">Create
                a
                team</Button>
        </div>
        <div>
            <div class="">
                <div class="w-full py-4">
                    <div class="rounded-xl px-5">
                        <div class="grid grid-cols-12 items-center">
                            <div class="col-span-6 text-xs font-light">Name</div>
                            <div class="col-span-3 text-xs font-light">Permission</div>
                            <div class="col-span-2 text-xs font-light">Owner</div>
                            <div class="col-span-1 text-xs font-light"></div>
                        </div>
                    </div>

                    <div v-if="!user_team_refs.isLoading && !pageLoad" class="py-2">
                        <div v-for="team in user_team_refs.data" :key="team.tm_id"
                            class="cursor-pointer rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300">
                            <div class="grid grid-cols-12 items-center">
                                <div class="col-span-6"
                                    @click="router.push({ name: 'team-view', params: { team_id: team.tm_id } })">
                                    <div class="flex items-center gap-x-3">
                                        <i class="bx text-2xl bx-google"></i>
                                        <div class="grid gap-0">
                                            <span class="text-sm">{{ team.name }}</span>
                                            <span class="text-xs">{{ team.members.length }} Members</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-span-3 text-sm text-gray-600">
                                    {{ `read and write` }}
                                </div>
                                <div class="col-span-2 flex flex-col">
                                    <span class="font-bold text-sm">
                                        {{ team_owners[team.owner_uid].uid === user_auth.data?.uid ? `${team_owners[team.owner_uid].displayName} (You)` : team_owners[team.owner_uid].displayName }}
                                    </span>
                                    <span class="text-xs text-gray-600">{{ team_owners[team.owner_uid].email
                                        }}</span>
                                </div>
                                <div class="col-span-1 flex justify-end">
                                    <button type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-full text-black duration-100 hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                                        <i class="material-icons text-md">more_vert</i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="rounded-xl px-2 py-4">
                        <div class="grid grid-cols-12 items-center space-y-3">
                            <div class="col-span-5">
                                <Skeleton class="h-3 w-[300px] rounded-full bg-gray-300" />
                            </div>
                            <div class="col-span-7">
                                <Skeleton class="h-3 w-[full] rounded-full bg-gray-300" />
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-2">
                        <Button variant="outline" size="xs"> Sample Load More </Button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <CreateTeam :open_modal="new_team_modal" @return="new_team_return" />
</template>