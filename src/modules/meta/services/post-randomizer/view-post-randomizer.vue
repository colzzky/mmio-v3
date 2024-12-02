<script lang="ts" setup>
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
import type { PostRandomizerServiceData } from '@/core/types/WorkSpaceTypes';
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore';
import { onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';

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
const campaign = reactive<PostRandomizer>({
    data: null,
    posts: [],
    fetchLoad: false,
    postsfetchLoad: false
})

async function get_campaign(): Promise<void> {
    campaign.fetchLoad = true
    if (workspace_service.post_randomizer.data) {
        const find_campaign = workspace_service.post_randomizer.data.find(campaign => campaign.pr_id === randomizer_id)
        if (find_campaign) {
            campaign.data = { ...find_campaign }
            campaign.fetchLoad = false
            return;
        }
    }

    const get = await service_models.post_randomizer.get(randomizer_id)
    if (get.status) {
        console.log(get.data)
        campaign.data = { ...get.data }
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
})
</script>
<template>
    <Main>
        <div v-if="!campaign.fetchLoad">
            <div v-if="campaign.data">
                <div>
                    <form id="form" class="flex flex-col gap-y-4">
                        <div class="flex flex-col gap-y-2">
                            <Label for="mediaSource">Media Source</Label>
                            <Select id="mediaSource" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Source Foo">Source Foo</SelectItem>
                                        <SelectItem value="Source Bar">Source Bar</SelectItem>
                                        <SelectItem value="Source Baz">Source Baz</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="flex flex-col gap-y-2">
                            <Label for="name">Name</Label>
                            <Input type="text" id="name" name="name" placeholder="Input Name" required />
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
                        <div class="grid grid-cols-2 gap-x-4">
                            <div class="flex flex-col gap-y-2">
                                <Label as="span">Start Date</Label>
                                <DatePicker />
                            </div>
                            <div class="flex flex-col gap-y-2">
                                <Label as="span">End Date</Label>
                                <DatePicker />
                            </div>
                        </div>
                    </form>
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