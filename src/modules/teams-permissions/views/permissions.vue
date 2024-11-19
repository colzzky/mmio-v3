<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import Button from '@/core/components/ui/button/Button.vue'
import { usePermissionStore } from '@/stores/permissionStore';
import { useAuthStore } from '@/stores/authStore';
import router from '@/router';
import { getWhereAny } from '@/core/utils/firebase-collections';
import type { PermissionData } from '@/core/types/PermissionTypes';
import { uiHelpers } from '@/core/utils/ui-helper';
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue';
const permissionStore = usePermissionStore()
const authStore = useAuthStore()
const { permission: permission_model } = permissionStore
const { user_auth, user_created_permissions:permissions } = authStore

const create_permission_load = ref<boolean>(false)
const pageLoad = ref(false)
/**
 * Step 1: Check if user auth data exist
 * Step 2: Initialize Permission_model from store to populate fresh data
 * Step 3: Post Permission to firstore
 * Step 4: If Success redirect to permission page, else return a toaster error
 */

async function create_permission() {
    create_permission_load.value = true
    if (user_auth.data) {
        permission_model.reInit()
        permission_model.data.owner_uid = user_auth.data.uid
        const add_permission = await permission_model.createUpdate("new")
        if (add_permission.status) {
            permissions.data.push(add_permission.data)
            router.push({ name: "permission-view", params: { permission_id: add_permission.data.permission_id } })
        }
    }
    create_permission_load.value = false
}

async function get_permissions() {
    permissions.isLoading = true
    const checkFetch = permissions.checkNextFetch()
    console.log(checkFetch)
    if (user_auth.data && checkFetch) {
        permissions.data = []
        const get = await getWhereAny('permission', 'permissions', {}, [], [{
            fieldName: 'owner_uid', operator: '==', value: user_auth.data.uid
        }])
        if (get.status) {
            get.data.forEach(permission => {
                permissions.data.push(permission)
            });
            permissions.lastSnapshot = get.data[get.data.length - 1].permission_id
            permissions.generateNextFetch()
            console.log(permissions)
        }
    }
    permissions.isLoading = false
}

onMounted(async () => {
    pageLoad.value = true
    //Do something here if you want to fetch first
    pageLoad.value = false
    await get_permissions()
})

</script>
<template>
    <div>
        <div class="flex items-center justify-between">
            <div class="text-lg font-bold">Your Created Permissions</div>
            <Button v-if="!create_permission_load" @click="create_permission" variant="ghost" class="font-bold text-blue-500">Create new
                Permission</Button>
            <Button v-else variant="outline" size="xs" disabled class="flex items-center gap-2">
                <i class="material-icons animate-spin text-sm">donut_large</i>Creating your permission
            </Button>
        </div>
        <div>
            <div class="">
                <div class="w-full py-4">
                    <div class="rounded-xl px-5">
                        <div class="grid grid-cols-12 items-center">
                            <div class="col-span-7 text-xs font-light">Name</div>
                            <div class="col-span-2 text-xs font-light">Created At</div>
                            <div class="col-span-2 text-xs font-light">Updated At</div>
                            <div class="col-span-1 text-xs font-light"></div>
                        </div>
                    </div>

                    <div v-if="!permissions.isLoading && !pageLoad" class="py-2">
                        <div v-if="permissions.data.length">
                            <div v-for="permission in permissions.data" :key="permission.permission_id"
                                class="cursor-pointer rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300">
                                <div class="grid grid-cols-12 items-center">
                                    <div class="col-span-7"
                                        @click="router.push({ name: 'permission-view', params: { permission_id: permission.permission_id } })">
                                        <div class="flex items-center gap-x-3">
                                            <i class="bx text-2xl bx-google"></i>
                                            <div class="grid gap-0">
                                                <span class="text-sm">{{ permission.name }}</span>
                                                <span class="text-xs">ID: {{ permission.permission_id }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-span-2 text-sm text-gray-600">
                                        {{ uiHelpers.formatDateTimeAgo(permission.createdAt) }}
                                    </div>
                                    <div class="col-span-2 flex flex-col">
                                        {{ uiHelpers.formatDateTimeAgo(permission.updatedAt) }}
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
                        <div v-else>
                            No available data.
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
                </div>
            </div>
        </div>
    </div>

</template>