<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue';
import DropdownMenu from '@/core/components/ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuCheckboxItem from '@/core/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue';
import DropdownMenuContent from '@/core/components/ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuLabel from '@/core/components/ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '@/core/components/ui/dropdown-menu/DropdownMenuSeparator.vue';
import DropdownMenuTrigger from '@/core/components/ui/dropdown-menu/DropdownMenuTrigger.vue';
import Input from '@/core/components/ui/input/Input.vue';
import Label from '@/core/components/ui/label/Label.vue';
import RadioGroup from '@/core/components/ui/radio-group/RadioGroup.vue';
import RadioGroupItem from '@/core/components/ui/radio-group/RadioGroupItem.vue';
import { toast } from '@/core/components/ui/toast';
import Toaster from '@/core/components/ui/toast/Toaster.vue';
import type { PermissionData } from '@/core/types/PermissionTypes';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { usePermissionStore } from '@/stores/permissionStore';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { z, type ZodRawShape } from 'zod';

const route = useRoute();
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const { user_auth, user_created_permissions: permissions } = authStore
const { permission: pm_model } = permissionStore
const pageLoad = ref<boolean>(false)
const permission_id = route.params.permission_id
const selected_permission = reactive({
    data: <PermissionData | null>null,
    isFetching: <boolean>false,
    changeNameLoad: <boolean>false,
    async changeName() {
        this.changeNameLoad = true
        const validated = await name_form.validateInput()
        if (validated && this.data) {
            this.data.name = name_form.input.name
            pm_model.set(this.data)
            const post = await pm_model.createUpdate("update")
            if (post.status) {
                pm_model.reInit()
                this.data = post.data
                toast({
                    title: 'Permission Name successfully changed',
                    variant: 'success',
                })
            } else {
                toast({
                    title: 'Permission Name change error. Please try again',
                    variant: 'destructive',
                })
            }
        } else {
            console.log('false')
        }
        this.changeNameLoad = false
    },
})

const name_form = reactive({
    input: <Pick<PermissionData, 'name'>>{
        name: ''
    },
    errors: <Pick<PermissionData, 'name'>>{
        name: ''
    },
    schema: <ZodRawShape>{
        name: z.string().min(4, { message: 'Permission name ust have a minimum of 4 characters' }),
    },
    async validateInput(): Promise<boolean> {
        Object.keys(this.errors).forEach((key) => {
            const field = key as keyof Pick<PermissionData, 'name'>
            this.errors[field] = ''
        })
        const result = z.object(this.schema as ZodRawShape).safeParse(this.input)

        if (!result.success) {
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof Pick<PermissionData, 'name'>
                this.errors[field] = err.message
                toast({
                    title: 'Change Permission Name Error',
                    description: 'Permission name is required',
                    variant: 'destructive',
                })
            })
            return false
        } else {
            return true
        }
    },
    revertName() {
        console.log(name_form.input.name)
        if (selected_permission.data && name_form.input.name === '') {
            name_form.input.name = selected_permission.data.name as string
        }
    }
})

const find_selected_permission = async () => {
    selected_permission.isFetching = true
    if (permissions.data.length) {
        const find_permission = permissions.data.find((permission: PermissionData) => permission.permission_id === permission_id)
        if (find_permission) {
            selected_permission.data = find_permission
        }
    } else {
        const find_permission = await pm_model.get(permission_id as string)
        if (find_permission.status) {
            selected_permission.data = find_permission.data
        }
    }
    selected_permission.isFetching = false
}

onMounted(async () => {
    pageLoad.value = true
    //Do something here if you want to fetch first
    pageLoad.value = false
    await find_selected_permission()
    if (selected_permission.data) {
        name_form.input.name = selected_permission.data.name as string
    } else {
        await router.push({ name: 'permission' })
    }
})

</script>
<template>
    <Toaster />
    <div v-if="!selected_permission.isFetching">
        <div v-if="selected_permission.data" class="space-y-4">
            <div class="flex items-center space-x-2">
                <Button variant="ghost" class="flex" @click="router.push({ name: 'permissions' })"><i
                        class="material-icons text-md">arrow_back</i></Button>
                <Input v-model="name_form.input.name" type="text" placeholder="Permission Name....."
                    @blur="name_form.revertName" @keyup.enter="selected_permission.changeName()"
                    class="border-x-0 border-y-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none focus:border focus:rounded-lg focus-visible:border-blue-600 font-bold text-lg max-w-[50%]"
                    :class="{ '!border !rounded-lg !border-blue-600': name_form.input.name !== selected_permission.data.name || selected_permission.changeNameLoad }" />
                <Button v-if="name_form.input.name && name_form.input.name !== selected_permission.data.name"
                    variant="secondary" size="xs" class="text-blue-500"
                    @click="selected_permission.changeName()">Save</Button>
                <Button v-else-if="selected_permission.changeNameLoad" variant="outline" size="xs" disabled
                    class="flex items-center gap-2">
                    <i class="material-icons animate-spin text-sm">donut_large</i>Changing Permission Name...
                </Button>
            </div>
            <div class="bg-gray-100 border-gray-200 rounded-lg py-4">
                <div class="">
                    <div class="px-5 py-2">
                        <Input type="search" placeholder="Search Permissions..." class="ps-10" />
                    </div>
                    <div>
                        <div class="px-5 py-5 space-y-4">
                            <div class="text-lg font-bold">Chatbot Flow Service Permissons</div>
                            <div class="space-y-2">
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Default Access Level:</span>
                                    <div class="col-span-4 flex space-x-4 items-cente justify-between">
                                        <span>Read, Full, Delete</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button class="text-blue-500" variant="outline" size="xs">
                                                    Change Access Level
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent class="w-56">
                                                <DropdownMenuLabel>Access Levels</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuCheckboxItem>
                                                    Full
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem>
                                                    Read
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem>
                                                    Write
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem>
                                                    Delete
                                                </DropdownMenuCheckboxItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Set Custom Permission:</span>
                                    <div class="col-span-4">
                                        <RadioGroup default-value="No" orientation='horizontal' class="flex space-x-2">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r1" value="Yes" />
                                                <Label for="r1">Yes</Label>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r2" value="No" />
                                                <Label for="r2">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr class="border-gray-200" />
                    </div>
                    <div>
                        <div class="px-5 py-5 space-y-4">
                            <div class="text-lg font-bold">Comment Auto Reply Permissons</div>
                            <div class="space-y-2">
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Default Access Level:</span>
                                    <div class="col-span-4 flex space-x-4 items-cente justify-between">
                                        <span>Custom</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button class="text-blue-500" variant="outline" size="xs">
                                                    Change Access Level
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent class="w-56">
                                                <DropdownMenuLabel>Access Levels</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuCheckboxItem>
                                                    Full
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem>
                                                    Read
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem>
                                                    Write
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem>
                                                    Delete
                                                </DropdownMenuCheckboxItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Set Custom Permission:</span>
                                    <div class="col-span-4">
                                        <RadioGroup default-value="No" orientation='horizontal' class="flex space-x-2">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r1" value="Yes" />
                                                <Label for="r1">Yes</Label>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r2" value="No" />
                                                <Label for="r2">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div class="col-span-4 pt-4 pb-2">
                                    <span class="text-lg">Custom Permissions</span>
                                </div>
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Read:</span>
                                    <div class="col-span-4">
                                        <RadioGroup default-value="Yes" orientation='horizontal' class="flex space-x-2">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r1" value="Yes" />
                                                <Label for="r1">Yes</Label>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r2" value="No" />
                                                <Label for="r2">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Add:</span>
                                    <div class="col-span-4">
                                        <RadioGroup default-value="Yes" orientation='horizontal' class="flex space-x-2">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r1" value="Yes" />
                                                <Label for="r1">Yes</Label>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r2" value="No" />
                                                <Label for="r2">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Edit:</span>
                                    <div class="col-span-4">
                                        <RadioGroup default-value="Yes" orientation='horizontal' class="flex space-x-2">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r1" value="Yes" />
                                                <Label for="r1">Yes</Label>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r2" value="No" />
                                                <Label for="r2">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Publish:</span>
                                    <div class="col-span-4">
                                        <RadioGroup default-value="Yes" orientation='horizontal' class="flex space-x-2">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r1" value="Yes" />
                                                <Label for="r1">Yes</Label>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r2" value="No" />
                                                <Label for="r2">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div class="grid grid-cols-6">
                                    <span class="col-span-2 text-sm font-semibold">Delete:</span>
                                    <div class="col-span-4">
                                        <RadioGroup default-value="Yes" orientation='horizontal' class="flex space-x-2">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r1" value="Yes" />
                                                <Label for="r1">Yes</Label>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem id="r2" value="No" />
                                                <Label for="r2">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr class="border-gray-200" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        Loading....
    </div>
</template>