<script setup lang="ts" generic="T extends Node<keyof NodeType>">
import Avatar from '@/core/components/ui/avatar/Avatar.vue'
import CustomSocket from '../customSocket.vue'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from '@/core/components/ui/select'
import { Textarea } from '@/core/components/ui/textarea'
import { toast } from '@/core/components/ui/toast'
import type { FBAttachmentTemplate } from '@/modules/meta/utils/flow-meta-types'
import {
    createMetaTemplateOutIn,
    MetaTemplateOutput,
    ReteSockets,
    type AreaExtra,
    type CarouselCard,
    type Button as CarouselButton,
    type Node,
    type NodeType,
    type Schemes,
} from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { ClassicPreset } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import AvatarImage from '@/core/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '@/core/components/ui/avatar/AvatarFallback.vue'

const authWorkspace = useAuthWorkspaceStore()
const { active_workspace } = authWorkspace

const props = defineProps<{
    node: T
    node_id: string
    area: AreaPlugin<Schemes, AreaExtra>
}>()

const replies = ref<MetaTemplateOutput[]>([])
const quickReplies = ref<MetaTemplateOutput[]>([])
const node_obj = ref<Node<'carousel_node'> | null>(null)

type State = 'main' | 'create-card' | 'create-quick-reply-button' | 'create-reply-button'
const sheetState = ref<State>('main')
function handleChangeSheetState(state: State) {
    sheetState.value = state
}

function resetState() {
    replies.value = []
    quickReplies.value = []
    node_obj.value = null
}

function initialize() {
    resetState()
    console.log('test')
    console.log(props.node)
    node_obj.value = props.node as Node<'carousel_node'>
    if (node_obj.value.data) {
        node_obj.value.data.name = node_obj.value.data.name || 'Untitled Node'
    }
}

const card_form = reactive({
    data: {
        image: '',
        image_aspect_ratio: 'horizontal',
        title: 'Untitled Button',
        text: '',
        buttons: {}
    } as CarouselCard,
    button: {
        title: 'Untitled Button',
        type: 'postback',
        messenger_extensions: 'FALSE',
        url: '',
        payload: ''
    } as CarouselButton,
    button_list: [] as CarouselButton[],
    add_new_button() {
        if (node_obj.value && node_obj.value.data) {
            this.button_list.push({ ...this.button })
            this.button = {
                title: 'Untitled Button',
                type: 'postback',
                messenger_extensions: 'FALSE',
                url: '',
            }
        }
        handleChangeSheetState('create-card')
    },
    add_card() {
        if (node_obj.value && node_obj.value.data) {
            const node = node_obj.value
            const node_obj_val = node_obj.value.data
            this.button_list.forEach((button) => {
                const reply_origin = createMetaTemplateOutIn({
                    node,
                    socket: ReteSockets['carouselItem'],
                })
                const postback_id = `${crypto.randomUUID()}` // Origin Id where it will be referenced
                node_obj_val.giver_data[reply_origin.key] = postback_id
                this.data.buttons[reply_origin.key] = {
                    ...button,
                }
            })
            node_obj_val.cards.push({
                ...this.data
            })

        }
        initialize()
        props.area.update('node', props.node.id)
        handleChangeSheetState('main')
        toast({
            title: 'New Reply Button Added',
            variant: 'success',
            duration: 1000,
        })
    }
})

const quick_reply_button = reactive({
    title: 'Untitled Reply',
    content_type: 'text' as FBAttachmentTemplate.QuickReply['content_type'],
    add_new_reply() {
        if (node_obj.value && node_obj.value.data) {
            const quickreply_origin = createMetaTemplateOutIn({
                node: node_obj.value,
                socket: ReteSockets['quickreply'],
            })
            const postback_id = `${crypto.randomUUID()}` // Origin Id where it will be referenced
            node_obj.value.data.giver_data[quickreply_origin.key] = postback_id
            node_obj.value.data.quick_replies[quickreply_origin.key] = {
                title: this.title,
                content_type: this.content_type,
                payload: postback_id,
            }
            initialize()
            props.area.update('node', props.node.id)
            // console.log(props.area)
            toast({
                title: 'New Reply Button Added',
                variant: 'success',
                duration: 1000,
            })
        }
    },
})

watch(
    () => props.node_id,
    async (init_new, init_old) => {
        if (init_new !== init_old) {
            initialize()
        }
    },
)

onMounted(() => {
    initialize()
})
onUnmounted(() => {
    resetState()
})
</script>

<template>
    <div class="space-y-5">
        <div>
            <div
                class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 items-center gap-x-4 text-sm [--icon-size:theme(spacing.6)]">
                <Icon v-if="sheetState === 'main'" icon="bx:message" class="row-span-full size-[var(--icon-size)]" />
                <button v-else type="button" @click="sheetState !== 'create-reply-button' ? handleChangeSheetState('main') : handleChangeSheetState('create-card')" class="row-span-full">
                    <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
                </button>
                <span class="leading-none">{{ node_obj?.data?.name ? node_obj?.data?.name : 'Untitled Generic Node'
                    }}</span>
                <small class="leading-none text-muted-foreground">
                    Generic Node
                    <template v-if="sheetState === 'create-card'">
                        > Create Card
                    </template>
                    <template v-if="sheetState === 'create-reply-button'">
                        > Create Card > Create Message Reply Button
                    </template>
                    <template v-if="sheetState === 'create-quick-reply-button'">
                        > Create Quick Reply Button
                    </template>
                </small>
            </div>
        </div>
        <main v-if="sheetState === 'main' && node_obj && node_obj.data" class="grid gap-y-6 text-sm">
            <section class="grid gap-y-1.5">
                <Label for="nodeName">Node Name</Label>
                <Input v-model="node_obj.data.name" type="text" placeholder="What do you call this node" />
            </section>

            <!-- Card -->

            <section class="grid gap-y-1.5">
                <h3 class="font-semibold">Card List</h3>
                <ul class="col-span-full grid gap-y-3">
                    <template v-for="(card, key) in node_obj.data.cards" :key>
                        <li
                            class="grid grid-cols-[1fr_var(--icon-size)] items-center [--icon-size:theme(spacing.9)] *:leading-none">
                            <div class="flex gap-4 items-center">
                                <Avatar>
                                    <AvatarImage :src="card.image" alt="@radix-vue" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <p>{{ card.title }}</p>
                            </div>

                            <button type="button"
                                class="grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5">
                                <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                            </button>
                        </li>
                    </template>
                    <Button size="sm" variant="outline" class="!bg-none border-2 border-dashed"
                        @click="handleChangeSheetState('create-card')">
                        <p>Create New Card</p>
                    </Button>
                </ul>

            </section>


            <section class="grid grid-cols-2 gap-y-3">
                <h3 class="font-semibold">Quick Replies Buttons</h3>
                <ul class="col-span-full grid gap-y-3">
                    <template v-for="(quickReply, key) in node_obj.data.quick_replies" :key>
                        <li
                            class="grid grid-cols-[1fr_var(--icon-size)] items-center [--icon-size:theme(spacing.9)] *:leading-none">
                            <p>{{ quickReply.title }}</p>
                            <button type="button"
                                class="grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5">
                                <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                            </button>
                        </li>
                    </template>
                    <Button size="sm" variant="outline" class="!bg-none border-2 border-dashed"
                        @click="handleChangeSheetState('create-quick-reply-button')">
                        <p>Add Quick Reply Button</p>
                    </Button>
                </ul>
            </section>
        </main>
        <main v-else-if="sheetState === 'create-card'" class="grid gap-y-6 text-sm">
            <section class="grid gap-y-1.5">
                <Label for="nodeName">Image Url</Label>
                <Input v-model="card_form.data.image" type="text" placeholder="Enter Image URL" />
            </section>

            <div
                class="min-h-28 border-4 border-dotted rounded-lg p-2 border-gray-400 flex items-center justify-center">
                <img v-if="card_form.data.image" :src="card_form.data.image" alt="Placeholder Image"
                    class="max-w-full max-h-full object-contain rounded-lg" />
                <span v-else>Please put image URL</span>
            </div>

            <section class="grid gap-y-1.5">
                <Label for="title">Title:</Label>
                <Input v-model="card_form.data.title" type="text" id="title" name="title" rows="5"
                    placeholder="Whats the heading for this message?" />
            </section>

            <section class="grid gap-y-1.5">
                <Label for="message">Description:</Label>
                <Textarea v-model="card_form.data.text" id="message" name="message" rows="5"
                    placeholder="Whats the message you want to sent to the user?" />
            </section>
            <section class="grid grid-cols-2 gap-y-3">
                <h3 class="font-medium">Message Reply Buttons</h3>
                <ul class="col-span-full grid gap-y-3">
                    <template v-for="(reply, key) in card_form.button_list" :key>
                        <li
                            class="grid grid-cols-[1fr_var(--icon-size)] grid-rows-2 items-center [--icon-size:theme(spacing.9)] *:leading-none">
                            <p class="text-xs">{{ reply.title }}</p>
                            <strong>{{ reply.type }}</strong>
                            <button type="button"
                                class="col-start-2 row-span-full grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5">
                                <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                            </button>
                        </li>
                    </template>
                    <Button size="sm" variant="outline" class="!bg-none border-2 border-dashed" @click="handleChangeSheetState('create-reply-button')">
                    <p>Create New Reply Button</p>
                </Button>
                </ul>

            </section>
            <Button @click="card_form.add_card()">Save Card</Button>
        </main>

        <main v-else-if="sheetState === 'create-reply-button'" class="grid gap-y-6 text-sm">
            <section class="grid gap-y-1.5">
                <Label for="buttonName">Button Name</Label>
                <Input v-model="card_form.button.title" type="text" name="buttonName"
                    placeholder="What do you call this button" />
            </section>
            <section class="grid gap-y-1.5">
                <Label for="buttonName">Button Type</Label>
                <Select v-model="card_form.button.payload">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a button type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="web_url">Web Url</SelectItem>
                            <SelectItem value="postback">Postback</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </section>
            <Button @click="card_form.add_new_button()">Create Message Reply Button</Button>
        </main>

        <main v-else-if="sheetState === 'create-quick-reply-button'" class="grid gap-y-6 text-sm">
            <section class="grid gap-y-1.5">
                <Label for="quickReplyName">Quick Reply Name</Label>
                <Input v-model="quick_reply_button.title" id="quickReplyName" type="text" name="quickReplyName"
                    placeholder="What do you call this quick reply" />
            </section>

            <Button @click="quick_reply_button.add_new_reply()">Create Quick Reply Button</Button>
        </main>
    </div>
</template>