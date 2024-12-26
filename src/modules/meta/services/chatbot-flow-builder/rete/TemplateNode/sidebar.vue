<script setup lang="ts">
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
import { createMetaTemplateOutIn, MetaTemplateOutput, ReteSockets, type AreaExtra, type Node, type NodeType, type Schemes } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { node } from '@unovis/ts/components/sankey/style'
import { ClassicPreset } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import CustomSocket from '../customSocket.vue'
const authWorkspace = useAuthWorkspaceStore()
const { active_workspace } = authWorkspace

const props = defineProps<{
    node: Node<keyof NodeType>
    node_id: string
    area: AreaPlugin<Schemes, AreaExtra>
}>()

const replies = ref<MetaTemplateOutput[]>([])
const quickReplies = ref<MetaTemplateOutput[]>([])
const node_obj = ref<Node<'message_node'> | null>(null)

type State = 'main' | 'create-reply-button' | 'create-quick-reply-button'
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
    node_obj.value = props.node as Node<'message_node'>
    if (node_obj.value.data) {
        node_obj.value.data.name = node_obj.value.data.name || 'Untitled Node'
        node_obj.value.data.text = node_obj.value.data.text || ''
    }


    // Object.keys(props.node.outputs).forEach((key) => {
    //     if (props.node.outputs[key] instanceof MetaTemplateOutput) {
    //         if (props.node.outputs[key].type === 'reply') {
    //             replies.value.push(props.node.outputs[key])
    //         }
    //         if (props.node.outputs[key].type === 'quickReply') {
    //             quickReplies.value.push(props.node.outputs[key])
    //         }
    //     }
    // })
}

const reply_button = reactive({
    data: {
        type: 'postback',
        title: '',
        payload: '',
    } as FBAttachmentTemplate.Button,
    add_new_reply() {
        if (node_obj.value && node_obj.value.data) {
            const reply_origin = createMetaTemplateOutIn({
                node: node_obj.value,
                socket:ReteSockets['button']
            })
            const postback_id = `${crypto.randomUUID()}` // Origin Id where it will be referenced
            node_obj.value.data.giver_data[reply_origin.key] = postback_id
            node_obj.value.data.buttons[reply_origin.key] ={...this.data}
            initialize()
            props.area.update('node', props.node.id)
            // console.log(props.area)
            toast({
                title: 'New Reply Button Added',
                variant: 'success',
                duration: 1000,
            })
        }
    }
})

const quick_reply_button = reactive({
    title: 'Untitled Reply',
    content_type: 'text' as FBAttachmentTemplate.QuickReply['content_type'],
    add_new_reply() {
        if (node_obj.value && node_obj.value.data) {
            const quickreply_origin = createMetaTemplateOutIn({
                node: node_obj.value,
                socket:ReteSockets['quickreply']
            })
            const postback_id = `${crypto.randomUUID()}` // Origin Id where it will be referenced
            node_obj.value.data.giver_data[quickreply_origin.key] = postback_id
            node_obj.value.data.quick_replies[quickreply_origin.key] = {
                title:this.title,
                content_type: this.content_type,
                payload: postback_id
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
    }
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
                <button v-else type="button" @click="handleChangeSheetState('main')" class="row-span-full">
                    <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
                </button>
                <span class="leading-none">Flow Name 1</span>
                <small class="leading-none text-muted-foreground">
                    Message
                    <template v-if="sheetState === 'create-reply-button'">
                        > Create Message Reply Button
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
                <Input v-model="node_obj.data.name" d="nodeName" type="text" name="nodeName"
                    placeholder="What do you call this node" />
            </section>
            <section class="grid gap-y-1.5">
                <Label for="message">Message</Label>
                <Textarea v-model="node_obj.data.text" id="message" name="message" rows="5"
                    placeholder="Whats the message you want to sent to the user?" />
            </section>
            <section class="grid grid-cols-2 gap-y-3">
                <h3 class="font-medium">Message Reply Buttons</h3>
                <button type="button" class="justify-self-end font-medium text-red-400 hover:text-red-500"
                    @click="handleChangeSheetState('create-reply-button')">
                    Create
                </button>
                <!-- <ul class="col-span-full grid gap-y-3">
                    <template v-for="(reply, key) in replies" :key>
                        <li v-if="reply"
                            class="grid grid-cols-[1fr_var(--icon-size)] grid-rows-2 items-center [--icon-size:theme(spacing.9)] *:leading-none">
                            <p class="text-xs">{{ reply }}</p>
                            <strong>{{ reply.data.type }}</strong>
                            <button type="button"
                                class="col-start-2 row-span-full grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5">
                                <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                            </button>
                        </li>
                    </template>
                </ul> -->
            </section>
            <section class="grid grid-cols-2 gap-y-3">
                <h3 class="font-medium">Quick Replies Buttons</h3>
                <button type="button" class="justify-self-end font-medium text-blue-400 hover:text-blue-500"
                    @click="handleChangeSheetState('create-quick-reply-button')">
                    Create
                </button>
                <!-- <ul class="col-span-full grid gap-y-3">
                    <template v-for="(quickReply, key) in quickReplies" :key>
                        <li v-if="quickReply && quickReply.type === 'quickReply'"
                            class="grid grid-cols-[1fr_var(--icon-size)] items-center [--icon-size:theme(spacing.9)] *:leading-none">
                            <p>{{ quickReply.data.title }}</p>
                            <button type="button"
                                class="grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5">
                                <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                            </button>
                        </li>
                    </template>
                </ul> -->
            </section>
        </main>
        <main v-else-if="sheetState === 'create-reply-button'" class="grid gap-y-6 text-sm">
            <section class="grid gap-y-1.5">
                <Label for="buttonName">Button Name</Label>
                <Input v-model="reply_button.data.title" type="text" name="buttonName"
                    placeholder="What do you call this button" />
            </section>
            <section class="grid gap-y-1.5">
                <Label for="buttonName">Button Type</Label>
                <Select v-model="reply_button.data.payload">
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
            <Button @click="reply_button.add_new_reply()">Create Message Reply Button</Button>
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
