<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import Checkbox from '@/core/components/ui/checkbox/Checkbox.vue'
import Dialog from '@/core/components/ui/dialog/Dialog.vue'
import DialogContent from '@/core/components/ui/dialog/DialogContent.vue'
import DialogTitle from '@/core/components/ui/dialog/DialogTitle.vue'
import Input from '@/core/components/ui/input/Input.vue'
import Label from '@/core/components/ui/label/Label.vue'
import RadioGroup from '@/core/components/ui/radio-group/RadioGroup.vue'
import RadioGroupItem from '@/core/components/ui/radio-group/RadioGroupItem.vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import {
  Access_levels,
  admin_access,
  custom_access as custom_permission_struct,
  custom_permission,
  default_access,
  type AccessStructure,
  type CustomPermissions,
  type PermissionData,
  access_level_byservice,
  PermissionTypes,
  type GeneralPermission,
  permissionNames,
} from '@/core/types/PermissionTypes'
import { type TeamMembersData } from '@/core/types/TeamTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { getWhereAny, postCollection } from '@/core/utils/firebase-collections'
import { useAuthStore } from '@/stores/authStore'
import { useTeamStore } from '@/stores/teamStore'
import { onMounted, reactive, ref, watch } from 'vue'

const teamStore = useTeamStore()
const authStore = useAuthStore()
const { team_members } = teamStore
const { user_auth, user_created_permissions: permissions } = authStore
const custom_access = JSON.parse(JSON.stringify(custom_permission_struct)) as AccessStructure
const props = defineProps<{
  open_modal: boolean
  member: TeamMembersData | null
  member_name: string | null
  team_id: string
}>()

const componentLoad = ref<boolean>(false)
const accessLevelsArray = access_level_byservice
const custom_order = [...PermissionTypes]
const user_created_permissions = ref<PermissionData[]>([])

const emit = defineEmits<{
  (e: 'return', value: TeamMembersData | null): void
}>()

watch(
  () => props.open_modal,
  (newTrigger) => {
    if (newTrigger) {
      if (props.member) {
        member_permission_modal.isOpen = true
        member_permission_modal.member = JSON.parse(JSON.stringify(props.member))
        if (member_permission_modal.member) {
          current_permission.data = member_permission_modal.member.accessPermissions
          current_permission.generalPermission = member_permission_modal.member.generalPermissions
        }
        member_permission_modal.member_name = props.member_name
        member_permission_modal.team_id = props.team_id
      } else {
        emit('return', null)
      }
    }
  },
)

const member_permission_modal = reactive({
  member_name: '' as string | null,
  member: null as TeamMembersData | null,
  team_id: '' as string,
  isOpen: false,
  steps: '',
  data: {},
  processing_msg: '',
  async continue() { },
  previous() { },
  async save_access_permission() {
    if (this.member && current_permission.data) {
      this.member.accessPermissions = current_permission.data
      this.member.generalPermissions = current_permission.generalPermission
      team_members.reInit()
      team_members.set(this.member)
      const update_permission = await postCollection(DbCollections.team_members,
        {
          data:team_members.data,
          idKey:'member_id',
          $sub_params:{
            tm_id:this.team_id
          }
        }
      )
      
      if (update_permission.status && update_permission.data) {
        this.member = update_permission.data
        this.close(true)
      }
    }
  },
  close(isUpdate: boolean = false) {
    const pass_member_data = isUpdate ? this.member : null
    this.isOpen = false
      ; (this.member_name = ''), (this.team_id = ''), (this.member = null), current_permission.reset()
    emit('return', pass_member_data)
  },
  async createWorkspace() { },
})

const current_permission = reactive({
  data: null as AccessStructure | null,
  generalPermission: [] as GeneralPermission,
  isFetching: false as boolean,
  isPermissionChanged: false as boolean,
  saveLoad: false as boolean,
  changeNameLoad: false as boolean,
  async add_permission(key: keyof AccessStructure) {
    if (this.data) {
      this.isPermissionChanged = true
      this.data[key] = {
        access: [Access_levels.READ],
      }
      this.generalPermission.push(`${key}::view`)
    }
  },
  add_remove_access(key: keyof AccessStructure, access_level: Access_levels) {
    if (this.data && this.data[key]) {
      this.isPermissionChanged = true
      const index = this.data[key].access.indexOf(access_level)
      const custom = this.data[key].access.indexOf(Access_levels.CUSTOM)
      if (index !== -1) {
        //Remove General Permission
        this.generalPermission = this.generalPermission.filter(permission => !permission.startsWith(key))
        //Remove Access
        this.data[key].access.splice(index, 1)

        //Repopulate general permission
        this.data[key].access.forEach(access_level => {
          if (accessLevelsArray[key][access_level]) {
            accessLevelsArray[key][access_level].forEach(tx => {
              if (!(this.generalPermission.includes(`${key}::${tx}`))) {
                this.generalPermission.push(`${key}::${tx}`)
              }
            })
          }
        })
      } else {
        if (access_level === Access_levels.CUSTOM) {
          this.data[key].access = []
          this.data[key].custom = { ...custom_permission[key] }
          this.generalPermission = this.generalPermission.filter(permission => !permission.startsWith(key))
        }
        if (custom !== -1) {
          this.data[key].access.splice(custom, 1)
          delete this.data[key].custom
        }
        this.data[key].access.push(access_level)

        if (!(this.data[key].access.includes(Access_levels.CUSTOM))) {
          this.data[key].access.forEach(ac => {
            if (accessLevelsArray[key][ac]) {
              accessLevelsArray[key][ac].forEach(tx => {
                if (!(this.generalPermission.includes(`${key}::${tx}`))) {
                  this.generalPermission.push(`${key}::${tx}`)
                }

              })
            }
          })
        }
      }
    }
  },
  change_custom_permission(key: keyof AccessStructure, custom_key: keyof CustomPermissions) {
    if (this.data && this.data[key] && this.data[key].custom) {
      this.isPermissionChanged = true
      this.data[key].custom[custom_key] = !this.data[key].custom[custom_key]

      if (this.data[key].custom[custom_key] === true) {
        this.generalPermission.push(`${key}::${custom_key}`)
      } else {
        const general_index = this.generalPermission.indexOf(`${key}::${custom_key}`)
        if (general_index !== -1) {
          this.generalPermission.splice(general_index, 1)
        }
      }
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
  set_permission(type: 'default' | 'admin' | 'custom') {
    if (type === 'admin') {
      this.data = JSON.parse(JSON.stringify(admin_access))
      this.generalPermission = populate_general_permission(this.data)
    }

    if (type === 'default') {
      this.data = JSON.parse(JSON.stringify(default_access))
      this.generalPermission = populate_general_permission(this.data)
    }
    if (type === 'custom') {
      this.data = JSON.parse(JSON.stringify(custom_access))
      this.generalPermission = populate_general_permission(this.data)
    }
  },

  set_custom_permission(access: AccessStructure) {
    this.data = JSON.parse(JSON.stringify(access))
    this.generalPermission = populate_general_permission(this.data)
  },

  reset() {
    this.data = null
    this.generalPermission = []
    this.isFetching = false
    this.isPermissionChanged = false
    this.saveLoad = false
    this.changeNameLoad = false
  },
})

async function get_user_created_permission() {
  permissions.isLoading = true
  const checkFetch = permissions.checkNextFetch()
  console.log(checkFetch)
  if (user_auth.data && checkFetch) {
    permissions.data = []
    const get = await getWhereAny(DbCollections.permissions, {
      whereConditions: [
        {
          fieldName: 'owner_uid',
          operator: '==',
          value: user_auth.data.uid,
        },
      ],
    })
    if (get.status && get.data.length) {
      permissions.data = get.data
      permissions.generateNextFetch()
      console.log(permissions)
    }
  }
  user_created_permissions.value = permissions.data

  permissions.isLoading = false
}

function populate_general_permission(data: AccessStructure | null) {
  const general_permission: GeneralPermission = []
  if (data) {
    Object.keys(data).forEach(k => {
      const key = k as keyof AccessStructure
      if (data[key]) {
        data[key].access.forEach(ac => {
          if (accessLevelsArray[key][ac]) {
            accessLevelsArray[key][ac].forEach(tx => {
              if (!(general_permission.includes(`${key}::${tx}`))) {
                general_permission.push(`${key}::${tx}`)
              }
            })
          }
        })
      }
    })
  }
  return general_permission
}



onMounted(async () => {
  componentLoad.value = true
  await get_user_created_permission()
  console.log(user_created_permissions.value)
  componentLoad.value = false
})
</script>

<template>
  <Dialog v-model:open="member_permission_modal.isOpen">
    <DialogContent @interact-outside="(e) => e.preventDefault()" class="min-h-[60%] sm:max-w-[75%]">
      <div v-if="!componentLoad" class="container mx-auto space-y-5 py-4">
        <div class="flex items-center justify-between">
          <DialogTitle>Set permission for {{ member_permission_modal.member_name }}</DialogTitle>
          <div>
            <button
              class="right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close" @click="member_permission_modal.close()">
              <i class="material-icons">close</i>
            </button>
          </div>
        </div>
        <!-- This part is changing -->

        <div class="spa grid grid-cols-3 gap-4">
          <div class="col-span-1 flex flex-col space-y-3">
            <div class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-100 p-4">
              <div class="text-sm font-semibold">Default Permissions:</div>
              <div class="flex items-center justify-between">
                <span class="cursor-pointer text-xs font-semibold">Set Permission to default/member</span>
                <Button @click="current_permission.set_permission('default')" class="text-blue-500" variant="ghost"
                  size="xs">
                  Apply
                </Button>
              </div>

              <div class="flex items-center justify-between">
                <span class="cursor-pointer text-xs font-semibold">Set Permission to default/Admin</span>
                <Button @click="current_permission.set_permission('admin')" class="text-blue-500" variant="ghost"
                  size="xs">
                  Apply
                </Button>
              </div>

              <div class="flex items-center justify-between">
                <span class="cursor-pointer text-xs font-semibold">Set Permission to default/Custom</span>
                <Button @click="current_permission.set_permission('custom')" class="text-blue-500" variant="ghost"
                  size="xs">
                  Apply
                </Button>
              </div>
            </div>

            <div
              class="flex max-h-[50%] min-h-[10%] flex-col gap-4 overflow-scroll rounded-lg border border-gray-200 bg-gray-100 p-4">
              <div class="text-sm font-semibold">Created Permissions:</div>
              <div v-for="permission in user_created_permissions" :key="permission.permission_id"
                class="flex items-center justify-between">
                <span class="cursor-pointer text-xs font-semibold">{{ permission.name }}</span>
                <Button @click="current_permission.set_custom_permission(permission.assignment)" class="text-blue-500"
                  variant="outline" size="xs">
                  Apply
                </Button>
              </div>
            </div>
          </div>

          <div class="col-span-2">
            <div class="space-y-3">
              <div class="flex items-center space-x-4">
                <Input type="search" placeholder="Search Permissions..." class="" />
                <Button v-if="!current_permission.saveLoad" variant="outline" size="sm" class="flex items-center gap-2"
                  @click="member_permission_modal.save_access_permission()">
                  <i class="material-icons text-sm">save</i>Save All
                </Button>
                <Button v-else variant="outline" size="sm" class="flex items-center gap-2" disabled>
                  <i class="material-icons animate-spin text-sm">donut_large</i>Save All
                </Button>
              </div>
              <div class="max-h-[40vh] overflow-scroll rounded-lg border border-gray-200 bg-gray-100 py-4">
                <div v-if="!current_permission.saveLoad">
                  <div v-for="(custom, key, index) in custom_access" :key="key">
                    <div v-if="
                      current_permission.data &&
                      key in current_permission.data &&
                      current_permission.data[key]
                    ">
                      <div class="space-y-4 px-5 py-5">
                        <div class="text-lg font-bold">{{ permissionNames[key] }} Permissons</div>
                        <div class="space-y-2">
                          <div class="grid grid-cols-6">
                            <span class="col-span-2 text-sm font-semibold">Default Access Level:</span>
                            <div class="items-cente col-span-4 flex justify-between space-x-4">
                              <div class="flex space-x-2">
                                <div v-for="(
                                    access_value, access_level, access_key
                                  ) in accessLevelsArray[key]" :key="access_key">
                                  <div v-if="access_level" class="flex items-center space-x-2">
                                    <Checkbox @update:checked="
                                      current_permission.add_remove_access(key, access_level)
                                      " :checked="current_permission.data[key].access.includes(access_level)
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
                            current_permission.data[key].custom &&
                            current_permission.data[key].access.includes(Access_levels.CUSTOM)
                          ">
                            <div class="pb-2 pt-4">
                              <span class="text-lg">Custom:</span>
                            </div>
                            <div class="space-y-2">
                              <div v-for="(
                                  custom_val, custom_key
                                ) in current_permission.sortCustomPermission(
                                    current_permission.data[key].custom,
                                  )" :key="custom_key" class="grid grid-cols-6">
                                <span class="col-span-2 text-sm font-semibold">{{ custom_key }}:</span>
                                <div class="col-span-4">
                                  <RadioGroup :default-value="current_permission.data[key].custom[custom_key] ? 'Yes' : 'No'
                                    " orientation="horizontal" @update:model-value="
                                      current_permission.change_custom_permission(key, custom_key)
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
                          <span class="text-lg font-bold">{{ permissionNames[key] }}</span>
                          <Button class="text-red-500" variant="outline" size="xs"
                            @click="current_permission.add_permission(key)">
                            Add this permission
                          </Button>
                        </div>
                      </div>
                      <hr v-if="!(index === Object.keys(custom_access).length - 1)" class="border-gray-200" />
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
        </div>
      </div>
      <div v-else>Loading....</div>
    </DialogContent>
  </Dialog>
</template>
