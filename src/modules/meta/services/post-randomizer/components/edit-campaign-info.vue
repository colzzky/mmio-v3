<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue'
import DatePicker from '@/core/components/ui/date-picker.vue'
import Input from '@/core/components/ui/input/Input.vue'
import Label from '@/core/components/ui/label/Label.vue'
import Select from '@/core/components/ui/select/Select.vue'
import SelectContent from '@/core/components/ui/select/SelectContent.vue'
import SelectGroup from '@/core/components/ui/select/SelectGroup.vue'
import SelectItem from '@/core/components/ui/select/SelectItem.vue'
import SelectTrigger from '@/core/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/core/components/ui/select/SelectValue.vue'
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import { toast } from '@/core/components/ui/toast'
import {
    days,
    months,
    type Days,
    type Months,
    type TransformedTimezone,
} from '@/core/types/UniTypes'
import {
    post_randomizer_service_data,
    type PostRandomizerServiceData,
} from '@/core/types/WorkSpaceTypes'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { onBeforeUnmount } from 'vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { z, type ZodRawShape } from 'zod'

type PostRandomizerFields = Pick<
    PostRandomizerServiceData,
    'name' | 'frequency' | 'time' | 'monthly' | 'weekly' | 'timezone'
> & {
    startDate: Date
    endDate: Date
}

type PostRandomizerErrors = {
    [Key in keyof Pick<
        PostRandomizerServiceData,
        'name' | 'frequency' | 'time' | 'monthly' | 'weekly' | 'startDate' | 'endDate' | 'timezone'
    >]: string
}

const route = useRoute()
const authWorkspaceStore = useAuthWorkspaceStore()
const { service_models } = authWorkspaceStore
const randomizer_id: string = route.params.randomizer_id as string
const time_selection = ref<string>('')
const timezoneList = ref<TransformedTimezone[]>([])
const timezoneString = () => {
    return [...timezoneList.value.map((timezone) => timezone.text)] as const
}
const component_load = ref<boolean>(false)
const emit = defineEmits<{
    (e: 'return', value: PostRandomizerServiceData | null): void
}>()

const props = defineProps<{ campaign_data: PostRandomizerServiceData }>()

const campaign_form = reactive({
    inputs: uiHelpers.shallowPick(
        post_randomizer_service_data,
        ['name', 'frequency', 'time', 'monthly', 'weekly', 'startDate', 'endDate', 'timezone'],
        {
            startDate: () => new Date(),
            endDate: () => new Date(),
        },
    ) as PostRandomizerFields,
    errors: {
        name: '',
        frequency: '',
        time: '',
        monthly: '',
        weekly: '',
        startDate: '',
        endDate: '',
        igAccounts: '',
        metaGroups: '',
        metaPages: '',
        timezone: '',
    } as PostRandomizerErrors,
    postLoad: false as boolean,
    schema(): ZodRawShape {
        return {
            name: z.string().min(5, { message: 'Campaign name must be at least 5 characters long' }),
            frequency: z.enum(['Daily', 'Weekly', 'Monthly'], {
                errorMap: () => ({ message: 'Frequency must be one of: Daily, Weekly, or Monthly' }),
            }),
            time: z
                .array(
                    z
                        .string()
                        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be in the format hh:mm' }),
                )
                .nonempty({ message: 'Time is required and must have at least one value.' }),

            timezone: z.enum(timezoneString() as unknown as [string, ...string[]], {
                errorMap: () => ({ message: 'Invalid Timezone. Must be a valid timezone.' }),
            }),
            monthly: z
                .array(
                    z.enum([...months], {
                        errorMap: () => ({ message: 'Invalid Month. Must be a valid Month.' }),
                    }),
                )
                .optional(),
            weekly: z
                .array(
                    z.enum([...days], {
                        errorMap: () => ({ message: 'Invalid day. Must be a valid day of the week.' }),
                    }),
                )
                .optional(),
            startDate: z
                .date() // Expecting a Date object
                .refine(
                    (value) => {
                        const today = new Date().setHours(0, 0, 0, 0) // Today's date at midnight
                        const startDate = value.setHours(0, 0, 0, 0) // Provided start date at midnight
                        return startDate >= today
                    },
                    {
                        message: 'Start date cannot be earlier than today',
                    },
                )
                .refine(
                    (value) => {
                        const startDate = value.setHours(0, 0, 0, 0) // Provided start date at midnight
                        const endDate = new Date(campaign_form.inputs.endDate).setHours(0, 0, 0, 0) // Provided end date at midnight
                        return startDate <= endDate
                    },
                    {
                        message: 'Start date cannot be later than end date',
                    },
                ),
            endDate: z
                .date()
                .refine(
                    (value) => {
                        const today = new Date().setHours(0, 0, 0, 0)
                        const endDate = value.setHours(0, 0, 0, 0)
                        return endDate >= today
                    },
                    {
                        message: 'End date cannot be earlier than today',
                    },
                )
                .refine(
                    (value) => {
                        const endDate = value.setHours(0, 0, 0, 0)
                        const startDate = new Date(campaign_form.inputs.startDate).setHours(0, 0, 0, 0)
                        return endDate >= startDate
                    },
                    {
                        message: 'End date cannot be earlier than start date',
                    },
                ),
        }
    },
    removeFrequencyAnswer() {
        this.validateSingleField('frequency')
        if (this.inputs.frequency === 'Daily') {
            this.inputs.weekly = []
            this.inputs.monthly = []
        } else if (this.inputs.frequency) {
            this.inputs.monthly = []
        }
    },
    removeTime(index: number) {
        this.inputs.time.splice(index, 1)
    },
    removeMonth(index: number) {
        this.inputs.monthly.splice(index, 1)
    },
    removeDay(index: number) {
        this.inputs.weekly.splice(index, 1)
    },
    addTime() {
        if (!this.inputs.time) {
            this.inputs.time = [`${time_selection.value}`]
        }
        const check_exist = this.inputs.time.find((t) => t === time_selection.value)
        if (!check_exist) {
            this.inputs.time.push(time_selection.value)
        }
        this.validateSingleField('time')
    },
    validateSingleField(field: keyof PostRandomizerFields): void | boolean {
        const value = this.inputs[field]
        this.errors[field] = ''
        const result = z.object(this.schema() as ZodRawShape).shape[field].safeParse(value)
        console.log(result)
        if (!result.success) {
            console.log(result.error.errors[0])
            this.errors[field] = result.error.errors[0].message
            return false
        }
        return true
    },
    validateDate(): void {
        this.validateSingleField('startDate')
        this.validateSingleField('endDate')
    },
    async validateDataInput(): Promise<boolean> {
        Object.keys(this.errors).forEach((key) => {
            const field = key as keyof PostRandomizerFields
            this.errors[field] = ''
        })
        const result = z.object(this.schema() as ZodRawShape).safeParse(this.inputs)

        if (!result.success) {
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof PostRandomizerFields
                this.errors[field] = err.message
            })
            return false
        } else {
            return true
        }
    },
    initializeForm() {
        this.inputs = uiHelpers.shallowPick(
            props.campaign_data,
            ['name', 'frequency', 'time', 'monthly', 'weekly', 'startDate', 'endDate', 'timezone'],
            {
                startDate: (value) => (value ? new Date(value as string) : new Date()),
                endDate: (value) => (value ? new Date(value as string) : new Date()),
            },
        ) as PostRandomizerFields
    },
    reset() {
        this.inputs = uiHelpers.shallowPick(post_randomizer_service_data, ['name', 'frequency', 'time', 'monthly', 'weekly', 'startDate', 'endDate', 'timezone'],
            {
                startDate: () => new Date(),
                endDate: () => new Date(),
            }) as PostRandomizerFields,
            (this.errors = {
                name: '',
                frequency: '',
                time: '',
                monthly: '',
                weekly: '',
                startDate: '',
                timezone: '',
                endDate: '',
            })
        emit('return', null)
    },
    async save() {
        this.postLoad = true
        const validate = await this.validateDataInput()
        if (validate) {
            const randomizer_model = service_models.post_randomizer
            randomizer_model.reInit()
            randomizer_model.data = {
                ...props.campaign_data,
                ...this.inputs,
                startDate: new Date(this.inputs.startDate).toLocaleDateString(),
                endDate: new Date(this.inputs.endDate).toLocaleDateString(),
                pr_id: randomizer_id,
            }
            const campaign_post = await randomizer_model.createUpdate('update')
            if (campaign_post.status) {
                emit('return', campaign_post.data)
                toast({
                    title: 'Campaign information has been saved',
                    variant: 'success',
                    duration: 2000,
                })
                randomizer_model.reInit()
            } else {
                console.log('Something wentwrong')
            }
        }
        this.postLoad = false
    },
})

const daysDropdownContainer = ref<HTMLElement | null>(null)
const monthsDropdownContainer = ref<HTMLElement | null>(null)
function handleMouseDownOutside(event: MouseEvent) {
    if (daysDropdownContainer.value && !daysDropdownContainer.value.contains(event.target as Node)) {
        days_dropdown.dropdown = false
    }
    if (
        monthsDropdownContainer.value &&
        !monthsDropdownContainer.value.contains(event.target as Node)
    ) {
        monthly_dropdown.dropdown = false
    }
}
const days_dropdown = reactive({
    days: [...days],
    dropdown: false,
    toggle() {
        this.dropdown = !this.dropdown
    },
    selectDays(day: Days) {
        if (!campaign_form.inputs.weekly) {
            campaign_form.inputs.weekly = [`${day}`]
        }
        const check_exist = campaign_form.inputs.weekly.includes(day)
        if (!check_exist) campaign_form.inputs.weekly.push(day)
        const validate = campaign_form.validateSingleField('weekly')
        if (!validate) {
            campaign_form.inputs.weekly.pop()
        }
        this.dropdown = false // Close dropdown after selection
    },
})

const monthly_dropdown = reactive({
    months: [...months],
    dropdown: false,
    toggle() {
        this.dropdown = !this.dropdown
    },
    selectMonth(month: Months) {
        if (!campaign_form.inputs.monthly) {
            campaign_form.inputs.monthly = [`${month}`]
        }
        const check_exist = campaign_form.inputs.monthly.includes(month)
        if (!check_exist) campaign_form.inputs.monthly.push(month)
        const validate = campaign_form.validateSingleField('monthly')
        if (!validate) {
            campaign_form.inputs.weekly.pop()
        }
        this.dropdown = false // Close dropdown after selection
    },
})

onMounted(async () => {
    component_load.value = true
    timezoneList.value = await uiHelpers.timezoneList()
    campaign_form.initializeForm()
    document.addEventListener('mousedown', handleMouseDownOutside)
    component_load.value = false
})
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleMouseDownOutside)
})
</script>
<template>
    <div class="space-y-4">
        <div class="flex items-center space-x-2">
            <Button variant="ghost" @click="campaign_form.reset()">
                <i class="material-icons text-md">arrow_back</i>
            </Button>
            <span class="text-lg font-bold">Update Campaign</span>
        </div>
        <div v-if="!component_load" class="grid grid-cols-2 gap-8">
            <div class="flex flex-col gap-y-4">
                <div class="flex items-center space-x-2">
                    <span class="text-lg font-bold">Update Information</span>
                </div>
                <div class="flex flex-col gap-y-2">
                    <Label for="name">Name</Label>
                    <Input v-model="campaign_form.inputs.name" type="text" id="name" name="name"
                        @blur="campaign_form.validateSingleField('name')" placeholder="Input Name" />
                    <div v-if="campaign_form.errors.name" class="flex items-center gap-1 text-xs text-red-500">
                        <i class="material-icons text-sm">error</i>
                        {{ campaign_form.errors.name }}
                    </div>
                </div>
                <div class="flex flex-col gap-y-2">
                    <Label>Timezone</Label>
                    <Select v-model="campaign_form.inputs.timezone"
                        @update:model-value="campaign_form.validateSingleField('timezone')">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem v-for="timezone in timezoneList" :value="timezone.text"
                                    :key="timezone.text">
                                    {{ timezone.text }}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div v-if="campaign_form.errors.timezone" class="flex items-center gap-1 text-xs text-red-500">
                        <i class="material-icons text-sm">error</i>
                        {{ campaign_form.errors.timezone }}
                    </div>
                </div>
                <div class="flex flex-col gap-y-2">
                    <Label>Frequency</Label>
                    <Select v-model="campaign_form.inputs.frequency"
                        @update:model-value="campaign_form.removeFrequencyAnswer()">
                        <SelectTrigger>
                            <SelectValue placeholder="Define Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div v-if="campaign_form.inputs.frequency !== 'Daily'" class="flex flex-col gap-y-2">
                    <Label>Weekly</Label>

                    <div class="relative" ref="daysDropdownContainer">
                        <!-- Button to trigger dropdown -->
                        <div class="flex cursor-pointer items-center justify-between rounded-md border p-2 text-sm"
                            @click="days_dropdown.toggle">
                            <div>
                                <div v-if="campaign_form.inputs.weekly && campaign_form.inputs.weekly.length > 0"
                                    class="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg">
                                    <div v-for="(day, index) in campaign_form.inputs.weekly" :key="day"
                                        class="flex items-center space-x-2 self-start rounded-full border border-gray-200 bg-gray-100 p-1 px-3 text-xs">
                                        <span class="text-sm font-semibold">{{ day }}</span>
                                        <button @click="campaign_form.removeDay(index)"
                                            class="text-color flex cursor-pointer items-center focus:outline-none">
                                            <i class="material-icons text-sm">close</i>
                                        </button>
                                    </div>
                                </div>
                                <div v-else>Choose a day</div>
                            </div>
                            <i class="material-icons text-md">arrow_drop_down</i>
                        </div>

                        <!-- Dropdown list with transition -->
                        <Transition>
                            <div v-show="days_dropdown.dropdown"
                                class="absolute left-0 z-10 h-[20vh] w-full transform overflow-scroll rounded-md border bg-white text-sm opacity-0 shadow-md transition-all duration-200 ease-in-out"
                                :class="{
                                    'translate-y-2 opacity-100': days_dropdown.dropdown,
                                    'translate-y-0 opacity-0': !days_dropdown.dropdown,
                                }">
                                <ul>
                                    <li v-for="day in days_dropdown.days" :key="day"
                                        @click="days_dropdown.selectDays(day)"
                                        class="cursor-pointer p-2 px-8 hover:bg-gray-200">
                                        {{ day }}
                                    </li>
                                </ul>
                            </div>
                        </Transition>
                    </div>
                    <div v-if="campaign_form.errors.weekly" class="flex items-center gap-1 text-xs text-red-500">
                        <i class="material-icons text-sm">error</i>
                        {{ campaign_form.errors.weekly }}
                    </div>
                </div>
                <div v-if="campaign_form.inputs.frequency === 'Monthly'" class="flex flex-col gap-y-2">
                    <Label>Monthly</Label>

                    <div class="relative" ref="monthsDropdownContainer">
                        <!-- Button to trigger dropdown -->
                        <div class="flex cursor-pointer items-center justify-between rounded-md border p-2 text-sm"
                            @click="monthly_dropdown.toggle">
                            <div>
                                <div v-if="campaign_form.inputs.monthly && campaign_form.inputs.monthly.length > 0"
                                    class="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg">
                                    <div v-for="(month, index) in campaign_form.inputs.monthly" :key="month"
                                        class="flex items-center space-x-2 self-start rounded-full border border-gray-200 bg-gray-100 p-1 px-3 text-xs">
                                        <span class="text-sm font-semibold">{{ month }}</span>
                                        <button @click="campaign_form.removeMonth(index)"
                                            class="text-color flex cursor-pointer items-center focus:outline-none">
                                            <i class="material-icons text-sm">close</i>
                                        </button>
                                    </div>
                                </div>
                                <div v-else>Choose a month</div>
                            </div>
                            <i class="material-icons text-md">arrow_drop_down</i>
                        </div>

                        <!-- Dropdown list with transition -->
                        <Transition>
                            <div v-show="monthly_dropdown.dropdown"
                                class="absolute left-0 z-10 h-[20vh] w-full transform overflow-scroll rounded-md border bg-white text-sm opacity-0 shadow-md transition-all duration-200 ease-in-out"
                                :class="{
                                    'translate-y-2 opacity-100': monthly_dropdown.dropdown,
                                    'translate-y-0 opacity-0': !monthly_dropdown.dropdown,
                                }">
                                <ul>
                                    <li v-for="month in monthly_dropdown.months" :key="month"
                                        @click="monthly_dropdown.selectMonth(month)"
                                        class="cursor-pointer p-2 px-8 hover:bg-gray-200">
                                        {{ month }}
                                    </li>
                                </ul>
                            </div>
                        </Transition>
                    </div>
                    <div v-if="campaign_form.errors.monthly" class="flex items-center gap-1 text-xs text-red-500">
                        <i class="material-icons text-sm">error</i>
                        {{ campaign_form.errors.monthly }}
                    </div>
                </div>
                <div class="flex flex-col gap-y-2">
                    <Label>Time to Post</Label>
                    <div class="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg border p-4">
                        <div v-for="(time, index) in campaign_form.inputs.time" :key="time"
                            class="flex items-center space-x-2 self-start rounded-full bg-blue-500 px-3 py-1">
                            <span v-if="time" class="text-sm font-semibold text-white">{{
                                uiHelpers.convertTimeToReadableFormat(time)
                            }}</span>
                            <button @click="campaign_form.removeTime(index)"
                                class="flex cursor-pointer items-center text-white focus:outline-none">
                                <i class="material-icons text-sm">close</i>
                            </button>
                        </div>

                        <div class="w-[20vh] rounded-full">
                            <input v-model="time_selection" type="time" @blur="campaign_form.addTime()"
                                @keyup.enter="campaign_form.addTime()" placeholder="Add Time"
                                class="h-10 w-full rounded-none border border-x-0 border-b border-t-0 border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50" />
                        </div>
                    </div>
                    <div v-if="campaign_form.errors.time" class="flex items-center gap-1 text-xs text-red-500">
                        <i class="material-icons text-sm">error</i>
                        {{ campaign_form.errors.time }}
                    </div>
                </div>
                <div class="flex flex-col gap-y-2">
                    <div class="grid grid-cols-2 gap-x-4">
                        <div class="flex flex-col gap-y-2">
                            <Label as="span">Start Date</Label>
                            <DatePicker v-model="campaign_form.inputs.startDate"
                                :initial-value="campaign_form.inputs.startDate"
                                @update:modelValue="campaign_form.validateDate()" />
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <Label as="span">End Date</Label>
                            <DatePicker v-model="campaign_form.inputs.endDate"
                                :initial-value="campaign_form.inputs.endDate"
                                @update:modelValue="campaign_form.validateDate()" />
                        </div>
                    </div>
                    <div v-if="campaign_form.errors.startDate || campaign_form.errors.endDate"
                        class="flex items-center gap-1 text-xs text-red-500">
                        <i class="material-icons text-sm">error</i>
                        {{ `${campaign_form.errors.startDate}` }}
                        <br />
                        {{ `${campaign_form.errors.endDate}` }}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <Button v-if="!campaign_form.postLoad" @click="campaign_form.save()">
                        Update Information
                    </Button>
                    <Button v-else variant="outline" disabled class="flex items-center gap-2">
                        <i class="material-icons animate-spin text-sm">donut_large</i>Updating your record
                    </Button>
                </div>
            </div>
            <div class="flex flex-col gap-y-4">
                <div>
                    <span class="text-lg font-bold">What platform to use</span>
                </div>
                <div class="flex flex-col gap-y-2">
                    <Label for="users">Instagram Business</Label>
                    <Select id="users" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Instagram Business" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="User Foo">User Foo</SelectItem>
                                <SelectItem value="User Bar">User Bar</SelectItem>
                                <SelectItem value="User Baz">User Baz</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div class="flex flex-col gap-y-2">
                    <Label for="pages">Pages</Label>
                    <Select id="pages" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Pages" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Page Foo">Page Foo</SelectItem>
                                <SelectItem value="Page Bar">Page Bar</SelectItem>
                                <SelectItem value="Page Baz">Page Baz</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div class="flex flex-col gap-y-2">
                    <Label for="groups">Groups</Label>
                    <Select id="groups" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Group Foo">Group Foo</SelectItem>
                                <SelectItem value="Group Bar">Group Bar</SelectItem>
                                <SelectItem value="Group Baz">Group Baz</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div class="flex">
                    <Button :disabled="campaign_form.postLoad"> Update Platforms </Button>
                </div>
            </div>
        </div>
        <div v-else class="grid grid-cols-2 gap-8">
            <div class="flex flex-col gap-y-4">
                <div class="flex flex-col gap-y-4">
                    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
                    </div>
                </div>
                <div class="flex flex-col gap-y-4">
                    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
                    </div>
                </div>
                <div class="flex flex-col gap-y-4">
                    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
                    </div>
                </div>
                <div class="flex flex-col gap-y-4">
                    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
                    </div>
                </div>
                <div class="flex flex-col gap-y-4">
                    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-y-4">
                <div class="flex flex-col gap-y-4">
                    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
                    </div>
                </div>
                <div class="flex flex-col gap-y-4">
                    <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
