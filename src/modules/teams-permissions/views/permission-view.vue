<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Checkbox from '@/core/components/ui/checkbox/Checkbox.vue'
import Input from '@/core/components/ui/input/Input.vue'
import Label from '@/core/components/ui/label/Label.vue'
import RadioGroup from '@/core/components/ui/radio-group/RadioGroup.vue'
import RadioGroupItem from '@/core/components/ui/radio-group/RadioGroupItem.vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import { toast } from '@/core/components/ui/toast'
import Toaster from '@/core/components/ui/toast/Toaster.vue'
import {
  Access_levels,
  custom_access as custom_permission_struct,
  type PermissionData,
  type AccessStructure,
  custom_permission,
  type CustomPermissions,
  access_level_byservice,
  permissionNames,
} from '@/core/types/PermissionTypes'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { usePermissionStore } from '@/stores/permissionStore'
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { z, type ZodRawShape } from 'zod'

const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const { user_created_permissions: permissions } = authStore
const { permission: pm_model } = permissionStore
const pageLoad = ref<boolean>(false)

const custom_order: (keyof CustomPermissions)[] = ['view', 'add', 'edit', 'delete', 'publish']
const permission_id = route.params.permission_id
const custom_access = JSON.parse(JSON.stringify(custom_permission_struct)) as AccessStructure
const selected_permission = reactive({
  data: null as PermissionData | null,
  isFetching: false as boolean,
  isPermissionChanged: false as boolean,
  saveLoad: false as boolean,
  changeNameLoad: false as boolean,
  async changeName() {
    this.changeNameLoad = true
    const validated = await name_form.validateInput()
    if (validated && this.data) {
      this.data.name = name_form.input.name
      pm_model.set(this.data)
      const post = await pm_model.createUpdate('update')
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
  async add_permission(key: keyof AccessStructure) {
    if (this.data) {
      this.isPermissionChanged = true
      this.data.assignment[key] = {
        access: [Access_levels.READ],
      }
      this.data.generalPermission.push(`${key}::view`)
    }
  },
  add_remove_access(key: keyof AccessStructure, access_level: Access_levels) {
    if (this.data && this.data.assignment[key]) {
      const data = this.data
      this.isPermissionChanged = true
      const index = this.data.assignment[key].access.indexOf(access_level)
      const custom = this.data.assignment[key].access.indexOf(Access_levels.CUSTOM)
      if (index !== -1) {
        //Remove General Permission
        this.data.generalPermission = this.data.generalPermission.filter(permission => !permission.startsWith(key))
        //Remove Access
        this.data.assignment[key].access.splice(index, 1)

        //Repopulate general permission
        this.data.assignment[key].access.forEach(access_level => {
          if (accessLevelsArray[key][access_level]) {
            accessLevelsArray[key][access_level].forEach(tx => {
              if(!(data.generalPermission.includes(`${key}::${tx}`))){
                  data.generalPermission.push(`${key}::${tx}`)
                }
            })
          }
        })
      } else {
        if (access_level === Access_levels.CUSTOM) {
          this.data.assignment[key].access = []
          this.data.assignment[key].custom = { ...custom_permission[key] }
          this.data.generalPermission = this.data.generalPermission.filter(permission => !permission.startsWith(key))
        }
        if (custom !== -1) {
          this.data.assignment[key].access.splice(custom, 1)
          delete this.data.assignment[key].custom
        }
        this.data.assignment[key].access.push(access_level)

        if (!(this.data.assignment[key].access.includes(Access_levels.CUSTOM))) {
          const data = this.data
          this.data.assignment[key].access.forEach(ac => {

            console.log('picked' + ac)
            console.log(accessLevelsArray[key])

            if (accessLevelsArray[key][ac]) {
              accessLevelsArray[key][ac].forEach(tx => {
                if(!(data.generalPermission.includes(`${key}::${tx}`))){
                  data.generalPermission.push(`${key}::${tx}`)
                }
                
              })
            }
          })
        }
      }
    }
  },
  change_custom_permission(key: keyof AccessStructure, custom_key: keyof CustomPermissions) {
    if (this.data && this.data.assignment[key] && this.data.assignment[key].custom) {
      this.isPermissionChanged = true
      this.data.assignment[key].custom[custom_key] = !this.data.assignment[key].custom[custom_key]

      if (this.data.assignment[key].custom[custom_key] === true) {
        this.data.generalPermission.push(`${key}::${custom_key}`)
      }else{
        const general_index = this.data.generalPermission.indexOf(`${key}::${custom_key}`)
        if(general_index !== -1){
          this.data.generalPermission.splice(general_index, 1)
        }
      }
    }
  },
  async save_access_permission() {
    if (this.isPermissionChanged) {
      this.saveLoad = true
      if (this.data) {
        pm_model.set(this.data)
        const save = await pm_model.createUpdate('update')
        if (save.status) {
          this.data = save.data
          pm_model.reInit()
          toast({
            title: 'Custom Permission successfully saved',
            variant: 'success',
          })
        }
      } else {
        toast({
          title: 'Something went wrong saving the permission, please try again',
          variant: 'destructive',
        })
      }
      this.saveLoad = false
    } else {
      toast({
        title: 'It seems that you haven not made any changes yet',
        variant: 'destructive',
        duration: 2000,
      })
    }
  },
  sortCustomPermission(custom: CustomPermissions) {
    const sortedPermissions: CustomPermissions = {} as CustomPermissions
    custom_order.forEach((order) => {
      if (order in custom) {
        sortedPermissions[order] = custom[order]
      }
    })
    return sortedPermissions
  },
})

async function find_selected_permission() {
  selected_permission.isFetching = true
  if (permissions.data.length) {
    const find_permission = permissions.data.find(
      (permission: PermissionData) => permission.permission_id === permission_id,
    )
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

const name_form = reactive({
  input: {
    name: '',
  } as Pick<PermissionData, 'name'>,
  errors: {
    name: '',
  } as Pick<PermissionData, 'name'>,
  schema: {
    name: z.string().min(4, { message: 'Permission name ust have a minimum of 4 characters' }),
  } as ZodRawShape,
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
  },
})

const accessLevelsArray = access_level_byservice

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
          class="max-w-[50%] rounded-none border-x-0 border-y-0 text-lg font-bold focus:rounded-lg focus:border focus-visible:border-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0"
          :class="{
            '!rounded-lg !border !border-blue-600':
              name_form.input.name !== selected_permission.data.name ||
              selected_permission.changeNameLoad,
          }" />
        <Button v-if="name_form.input.name && name_form.input.name !== selected_permission.data.name"
          variant="secondary" size="xs" class="text-blue-500" @click="selected_permission.changeName()">Save</Button>
        <Button v-else-if="selected_permission.changeNameLoad" variant="outline" size="xs" disabled
          class="flex items-center gap-2">
          <i class="material-icons animate-spin text-sm">donut_large</i>Changing Permission Name...
        </Button>
      </div>
      <div class="flex items-center space-x-4">
        <Input type="search" placeholder="Search Permissions..." class="" />
        <Button v-if="!selected_permission.saveLoad" variant="outline" size="sm" class="flex items-center gap-2"
          @click="selected_permission.save_access_permission()">
          <i class="material-icons text-sm">save</i>Save All
        </Button>
        <Button v-else variant="outline" size="sm" class="flex items-center gap-2" disabled>
          <i class="material-icons animate-spin text-sm">donut_large</i>Save All
        </Button>
      </div>
      <div class="rounded-lg border-gray-200 bg-gray-100 py-4">
        <div v-if="!selected_permission.saveLoad">
          <div v-for="(custom, key) in custom_access" :key="key">
            <div v-if="
              key in selected_permission.data.assignment &&
              selected_permission.data.assignment[key]
            ">
              <div class="space-y-4 px-5 py-5">
                <div class="text-lg font-bold">{{ permissionNames[key] }}</div>
                <div class="space-y-2">
                  <div class="grid grid-cols-6">
                    <span class="col-span-2 text-sm font-semibold">Default Access Level:</span>
                    <div class="items-cente col-span-4 flex justify-between space-x-4">
                      <div class="flex space-x-2">
                        <div v-for="(access_value, access_level, access_key) in accessLevelsArray[key]"
                          :key="access_key">
                          <div v-if="access_level" class="flex items-center space-x-2">
                            <Checkbox @update:checked="
                              selected_permission.add_remove_access(key, access_level)
                              " :checked="selected_permission.data.assignment[key].access.includes(
                                access_level,
                              )
                                " />
                            <label for="terms"
                              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {{ access_level }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="
                    selected_permission.data.assignment[key].custom &&
                    selected_permission.data.assignment[key].access.includes(Access_levels.CUSTOM)
                  ">
                    <div class="pb-2 pt-4">
                      <span class="text-lg">Custom:</span>
                    </div>
                    <div class="space-y-2">
                      <div v-for="(custom_val, custom_key) in selected_permission.sortCustomPermission(
                        selected_permission.data.assignment[key].custom,
                      )" :key="custom_key" class="grid grid-cols-6">
                        <span class="col-span-2 text-sm font-semibold">{{ custom_key }}:</span>
                        <div class="col-span-4">
                          <RadioGroup :default-value="selected_permission.data.assignment[key].custom[custom_key]
                            ? 'Yes'
                            : 'No'
                            " orientation="horizontal" @update:model-value="
                              selected_permission.change_custom_permission(key, custom_key)
                              " class="flex space-x-2">
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
                </div>
              </div>
              <hr class="border-gray-200" />
            </div>
            <div v-else>
              <div class="space-y-4 px-5 py-5">
                <div class="flex justify-between">
                  <span class="text-lg font-bold">{{ key }} Permissons</span>
                  <Button class="text-red-500" variant="outline" size="xs"
                    @click="selected_permission.add_permission(key)">
                    Add this permission
                  </Button>
                </div>
              </div>
              <hr class="border-gray-200" />
            </div>
          </div>
        </div>
        <div v-else class="flex justify-center p-4">
          <div>
            <span class="animate-pulse font-bold">Please wait while we save your permission</span>
            <Skeleton class="h-1 w-full rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="rounded-lg border-gray-200 bg-gray-100 p-4">Loading....</div>
  </div>
</template>
