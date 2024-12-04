<script lang="ts" setup>
import Button from '@/core/components/ui/button/Button.vue';
import DatePicker from '@/core/components/ui/date-picker.vue';
import Input from '@/core/components/ui/input/Input.vue';
import Label from '@/core/components/ui/label/Label.vue';
import Main from '@/core/components/ui/main.vue';
import Select from '@/core/components/ui/select/Select.vue';
import SelectContent from '@/core/components/ui/select/SelectContent.vue';
import SelectGroup from '@/core/components/ui/select/SelectGroup.vue';
import SelectItem from '@/core/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/core/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/core/components/ui/select/SelectValue.vue';
import { toast } from '@/core/components/ui/toast';
import { days, months, type Days, type Months, type TransformedTimezone } from '@/core/types/UniTypes';
import { post_randomizer_posts_data, post_randomizer_service_data, type PostRandomizerServiceData } from '@/core/types/WorkSpaceTypes';
import { uiHelpers } from '@/core/utils/ui-helper';
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { z, type ZodRawShape } from 'zod';

interface PostRandomizer {
    data: PostRandomizerServiceData | null
    posts: string[]
    fetchLoad: boolean
    postsfetchLoad: boolean
}

const route = useRoute()
const authWorkspaceStore = useAuthWorkspaceStore()
const { workspace_service, service_models } = authWorkspaceStore
const randomizer_id = route.params.randomizer_id as string
const time_selection = ref<string>('')
const timezoneList = ref<TransformedTimezone[]>([])

const campaign = reactive<PostRandomizer>({
    data: null,
    posts: [],
    fetchLoad: false,
    postsfetchLoad: false,
})

type PostRandomizerFields = Pick<PostRandomizerServiceData, 'name' | 'frequency' | 'time' | 'monthly' | 'weekly' | 'startDate' | 'endDate' | 'timezone'>
type PostRandomizerErrors = {
    [Key in keyof Pick<
        PostRandomizerServiceData,
        'name' | 'frequency' | 'time' | 'monthly' | 'weekly' | 'startDate' | 'endDate' | 'timezone'
    >]: string;
};

const campaign_form = reactive({
    inputs: uiHelpers.shallowPick(post_randomizer_service_data, ['name', 'frequency', 'time', 'monthly', 'weekly', 'startDate', 'endDate', 'timezone']),
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
    schema(): ZodRawShape {
        return {
            name: z.string().min(5, { message: 'Campaign name must be at least 5 characters long' }),
            frequency: z.enum(['Daily', 'Weekly', 'Monthly'], {
                errorMap: () => ({ message: 'Frequency must be one of: Daily, Weekly, or Monthly' })
            }),
            time: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be in the format hh:mm' })
            ).nonempty({ message: 'Time is required and must have at least one value.' }),
            monthly: z.array(
                z.enum([...months], {
                    errorMap: () => ({ message: 'Invalid Month. Must be a valid Month.' }),
                })
            ).optional(),
            weekly: z.array(
                z.enum([...days], {
                    errorMap: () => ({ message: 'Invalid day. Must be a valid day of the week.' }),
                })
            ).optional(),
            startDate: z
                .string()
                .refine((value) => !isNaN(Date.parse(value)), {
                    message: 'Start date must be a valid date',
                })
                .refine(
                    (value) => {
                        const today = new Date().setHours(0, 0, 0, 0); // Today's date at midnight
                        const startDate = new Date(value).setHours(0, 0, 0, 0); // Provided start date at midnight
                        return startDate >= today;
                    },
                    { message: 'Start date cannot be earlier than today' }
                )
                .refine(
                    (value) => {
                        const startDate = new Date(value).setHours(0, 0, 0, 0); // Provided start date at midnight
                        const endDate = new Date(campaign.data ? campaign.data.endDate : '').setHours(0, 0, 0, 0); // Provided end date at midnight
                        return startDate <= endDate;
                    },
                    { message: 'Start date cannot be later than end date' }
                ),
            endDate: z
                .string()
                .refine((value) => !isNaN(Date.parse(value)), {
                    message: 'End date must be a valid date',
                })
                .refine(
                    (value) => {
                        const today = new Date().setHours(0, 0, 0, 0); // Today's date at midnight
                        const endDate = new Date(value).setHours(0, 0, 0, 0); // Provided end date at midnight
                        return endDate >= today;
                    },
                    { message: 'End date cannot be earlier than today' }
                )
                .refine(
                    (value) => {
                        const endDate = new Date(value).setHours(0, 0, 0, 0); // Provided end date at midnight
                        const startDate = new Date(campaign.data ? campaign.data.startDate : '').setHours(0, 0, 0, 0); // Provided start date at midnight
                        return endDate >= startDate;
                    },
                    { message: 'End date cannot be earlier than start date' }
                ),
        }
    },
    removeFrequencyAnswer() {
        if (this.inputs.frequency === 'Daily') {
            this.inputs.weekly = []
            this.inputs.monthly = []
        }
        else if (this.inputs.frequency) {
            this.inputs.monthly = []
        }
    },
    addTime() {
        if (!this.inputs.time) {
            this.inputs.time = [`${time_selection.value}`]
        }
        const check_exist = this.inputs.time.find(t => t === time_selection.value)
        if (!check_exist) {
            this.inputs.time.push(time_selection.value)
        }
    },
    validateSingleField(field: keyof PostRandomizerFields): void {
        const value = this.inputs[field]
        this.errors[field] = ''
        const result = z.object(this.schema() as ZodRawShape).shape[field].safeParse(value)
        if (!result.success) {
            console.log(result.error.errors[0])
            this.errors[field] = result.error.errors[0].message
        }
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
        if (campaign.data) {
            this.inputs = uiHelpers.shallowPick(campaign.data, ['name', 'frequency', 'time', 'monthly', 'weekly', 'startDate', 'endDate', 'timezone'])
        }
    },
    reset() {
        this.inputs = uiHelpers.shallowPick(post_randomizer_service_data, ['name', 'frequency', 'time', 'monthly', 'weekly', 'startDate', 'endDate', 'timezone']),
            this.errors = {
                name: '',
                frequency: '',
                time: '',
                monthly: '',
                weekly: '',
                startDate: '',
                timezone: '',
                endDate: '',
            }
    },
    async save() {
        if (campaign.data) {
            const randomizer_model = service_models.post_randomizer
            randomizer_model.reInit()
            randomizer_model.data = {
                ...campaign.data,
                ...this.inputs,
                pr_id: randomizer_id
            }
            console.log(randomizer_model.data)
            const campaign_post = await randomizer_model.createUpdate('update')
            if (campaign_post.status) {
                console.log('Data has been saved')
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

    }
})

const daysDropdownContainer = ref<HTMLElement | null>(null)
const monthsDropdownContainer = ref<HTMLElement | null>(null)
function handleMouseDownOutside(event: MouseEvent) {
    if (daysDropdownContainer.value && !daysDropdownContainer.value.contains(event.target as Node)) {
        days_dropdown.dropdown = false;
    }
    if (monthsDropdownContainer.value && !monthsDropdownContainer.value.contains(event.target as Node)) {
        monthly_dropdown.dropdown = false;
    }
}
const days_dropdown = reactive({
    days: [...days],
    dropdown: false,
    toggle() {
        this.dropdown = !this.dropdown;
    },
    selectDays(day: Days) {
        console.log(campaign_form.inputs)
        if (!campaign_form.inputs.weekly) {
            campaign_form.inputs.weekly = [`${day}`]
        }
        const check_exist = campaign_form.inputs.weekly.includes(day)
        if (!check_exist) campaign_form.inputs.weekly.push(day)
        this.dropdown = false; // Close dropdown after selection
    },
})

const monthly_dropdown = reactive({
    months: [...months],
    dropdown: false,
    toggle() {
        this.dropdown = !this.dropdown;
    },
    selectMonth(month: Months) {
        if (!campaign_form.inputs.monthly) {
            campaign_form.inputs.monthly = [`${month}`]
        }
        const check_exist = campaign_form.inputs.monthly.includes(month)
        if (!check_exist) campaign_form.inputs.monthly.push(month)
        this.dropdown = false; // Close dropdown after selection
    }
})


async function get_campaign(): Promise<void> {
    campaign.fetchLoad = true
    timezoneList.value = await uiHelpers.timezoneList()
    if (workspace_service.post_randomizer.data) {
        const find_campaign = workspace_service.post_randomizer.data.find(campaign => campaign.pr_id === randomizer_id)
        console.log(find_campaign)
        if (find_campaign) {
            campaign.data = { ...find_campaign }
            campaign_form.initializeForm()
            campaign.fetchLoad = false
            return;
        }
    }

    const get = await service_models.post_randomizer.get(randomizer_id)
    if (get.status) {
        campaign.data = { ...get.data }
        campaign_form.initializeForm()
        campaign.fetchLoad = false
        return;
    } else {
        campaign.fetchLoad = false
        console.log('Error fetching or show this data is not available')
    }
}


onMounted(async () => {
    if (randomizer_id) {
        await get_campaign()
    }
    document.addEventListener("mousedown", handleMouseDownOutside);
})
onBeforeUnmount(() => {
    document.removeEventListener("mousedown", handleMouseDownOutside);
});






</script>
<template>
    <Main class="container mx-auto">
        <div v-if="!campaign.fetchLoad">
            <div v-if="campaign.data" class="space-y-5">
                <!-- {{ campaign_form.errors }} -->
                <div class="flex justify-start">
                    <span class="font-bold text-xl">{{ campaign.data.name }}</span>
                </div>
                <div class="flex justify-start">
                    <Button variant="outline" class="rounded-r-none border-r-0 w-[20vh] bg-gray-100 font-bold">Campaign
                        Details</Button>
                    <Button variant="outline" class="rounded-l-none w-[20vh]">Campaign Contents/Post</Button>
                </div>
                <div class="grid grid-cols-2 gap-8">
                    <div class="flex flex-col gap-y-4">
                        <div>
                            <span class="font-bold text-lg">Campaign Information</span>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <Label for="name">Name</Label>
                            <Input v-model="campaign_form.inputs.name" type="text" id="name" name="name"
                                placeholder="Input Name" />
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <Label>Timezone</Label>
                            <Select v-model="campaign_form.inputs.timezone">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem v-for="timezone in timezoneList" :value="timezone.name">
                                            {{ timezone.text }}</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
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
                                <div class="flex justify-between items-center p-2 border rounded-md cursor-pointer text-sm"
                                    @click="days_dropdown.toggle">
                                    <div>
                                        <div v-if="campaign_form.inputs.weekly && campaign_form.inputs.weekly.length > 0"
                                            class="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg">
                                            <div v-for="(day, index) in campaign_form.inputs.weekly" :key="day"
                                                class="flex items-center space-x-2 self-start rounded-full bg-gray-100 border border-gray-200 p-1 px-3 text-xs">
                                                <span class="text-sm font-semibold">{{ day }}</span>
                                                <button @click=""
                                                    class="flex cursor-pointer items-center text-color focus:outline-none">
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
                                        class="absolute left-0 w-full bg-white border rounded-md shadow-md z-10 text-sm transition-all duration-200 ease-in-out transform opacity-0 h-[20vh] overflow-scroll"
                                        :class="{ 'opacity-100 translate-y-2': days_dropdown.dropdown, 'opacity-0 translate-y-0': !days_dropdown.dropdown }">
                                        <ul>
                                            <li v-for="day in days_dropdown.days" :key="day"
                                                @click="days_dropdown.selectDays(day)"
                                                class="p-2 px-8 cursor-pointer hover:bg-gray-200">
                                                {{ day }}
                                            </li>
                                        </ul>
                                    </div>
                                </Transition>
                            </div>

                        </div>
                        <div v-if="campaign_form.inputs.frequency === 'Monthly'" class="flex flex-col gap-y-2">
                            <Label>Monthly</Label>

                            <div class="relative" ref="monthsDropdownContainer">
                                <!-- Button to trigger dropdown -->
                                <div class="flex justify-between items-center p-2 border rounded-md cursor-pointer text-sm"
                                    @click="monthly_dropdown.toggle">
                                    <div>
                                        <div v-if="campaign_form.inputs.monthly && campaign_form.inputs.monthly.length > 0"
                                            class="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg">
                                            <div v-for="(month, index) in campaign_form.inputs.monthly" :key="month"
                                                class="flex items-center space-x-2 self-start rounded-full bg-gray-100 border border-gray-200 p-1 px-3 text-xs">
                                                <span class="text-sm font-semibold">{{ month }}</span>
                                                <button @click=""
                                                    class="flex cursor-pointer items-center text-color focus:outline-none">
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
                                        class="absolute left-0 w-full bg-white border rounded-md shadow-md z-10 text-sm transition-all duration-200 ease-in-out transform opacity-0 h-[20vh] overflow-scroll"
                                        :class="{ 'opacity-100 translate-y-2': monthly_dropdown.dropdown, 'opacity-0 translate-y-0': !monthly_dropdown.dropdown }">
                                        <ul>
                                            <li v-for="month in monthly_dropdown.months" :key="month"
                                                @click="monthly_dropdown.selectMonth(month)"
                                                class="p-2 px-8 cursor-pointer hover:bg-gray-200">
                                                {{ month }}
                                            </li>
                                        </ul>
                                    </div>
                                </Transition>
                            </div>

                        </div>
                        <div class="flex flex-col gap-y-2">
                            <Label>Time to Post</Label>
                            <div class="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg border p-4">
                                <div v-for="(time, index) in campaign_form.inputs.time" :key="time"
                                    class="flex items-center space-x-2 self-start rounded-full bg-blue-500 py-1 px-3">
                                    <span v-if="time" class="text-sm font-semibold text-white">{{
                                        uiHelpers.convertTimeToReadableFormat(time) }}</span>
                                    <button @click=""
                                        class="flex cursor-pointer items-center text-white focus:outline-none">
                                        <i class="material-icons text-sm">close</i>
                                    </button>
                                </div>

                                <div class="w-[20vh] rounded-full">
                                    <input v-model="time_selection" type="time" @blur="campaign_form.addTime()"
                                        @keyup.enter="campaign_form.addTime()" placeholder="Add Time" class="h-10 w-full border border-input bg-background px-3 py-1 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
                                    rounded-none border-x-0 border-b border-t-0 text-sm focus-visible:border-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0
                                    " />
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-x-4">
                            <div class="flex flex-col gap-y-2">
                                <Label as="span">Start Date</Label>
                                <DatePicker v-model:model-value="campaign_form.inputs.startDate" />
                            </div>
                            <div class="flex flex-col gap-y-2">
                                <Label as="span">End Date</Label>
                                <DatePicker v-model:model-value="campaign_form.inputs.endDate" />
                            </div>
                        </div>
                        <div class="flex">
                            <Button @click="campaign_form.save()">
                                Update
                            </Button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-y-4">
                        <div>
                            <span class="font-bold text-lg">What platform to use</span>
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
                            <Button @click="campaign_form.save()">
                                Update Platforms
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                Nothing Found here
            </div>
        </div>
        <div v-else>
            Loading...
        </div>
    </Main>
</template>