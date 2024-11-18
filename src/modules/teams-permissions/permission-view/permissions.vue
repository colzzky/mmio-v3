<script lang="ts" setup>
import { ref } from 'vue';
import CreatePermissionModal from '../components/permission/CreatePermission.vue'
import Button from '@/core/components/ui/button/Button.vue'
import { usePermissionStore } from '@/stores/permissionStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
const permissionStore = usePermissionStore()
const authStore = useAuthStore()
const {permission:permission_model} = permissionStore
const {user_auth} = authStore

/**
 * Step 1: Check if user auth data exist
 * Step 2: Initialize Permission_model from store to populate fresh data
 * Step 3: Post Permission to firstore
 * Step 4: If Success redirect to permission page, else return a toaster error
 */

async function create_permission(){
    if(user_auth.data){
        permission_model.reInit()
        permission_model.data.owner_uid = user_auth.data.uid
        const add_permission = await permission_model.createUpdate("new")
        if(add_permission.status){
            console.log(add_permission.data)
        }
    }

}

const create_permission_modal = ref(false)
function create_permission_return() {
    create_permission_modal.value = false
}

</script>
<template>

<div class="flex flex-col items-start justify-normal gap-2">
        <Button @click="create_permission">Create new Workspace</Button>
    </div>

</template>