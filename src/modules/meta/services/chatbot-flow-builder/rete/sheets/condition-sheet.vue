<script setup lang="ts">
import { nodeIconMapping, type ConditionForm } from '../utils'
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/core/components/ui/dropdown-menu'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/core/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import { SheetHeader, SheetTitle, SheetDescription } from '@/core/components/ui/sheet'
import { toast } from '@/core/components/ui/toast'
import { createMetaTemplateOutIn, Node, ReteSockets } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref, watch } from 'vue'

const { active_flow } = storeToRefs(useAuthWorkspaceStore())
const { rete_init } = active_flow.value

const localNodeData = ref<Node<'condition_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(rete_init.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'condition_node'>
})

watch(
  () => rete_init.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'condition_node'>
    }
  },
)

// CHANGE SHEET STATE
type State = 'default' | 'create-condition' | 'edit-condition'
const sheetState = ref<State>('default')
function handleChangeState(state: State) {
  sheetState.value = state
}

const conditionForm = reactive<ConditionForm>({
  form: {
    label: '',
    type: '',
    qualifier: '',
    value: '',
  },
  initialState() {
    this.form = {
      label: '',
      type: '',
      qualifier: '',
      value: '',
    }

    this.intent = 'default'
  },

  submitForm(event) {
    const action = event.submitter?.dataset.action
    switch (action) {
      case 'create':
        this.createCondition()
        break
      case 'update':
        this.updateCondition()
        break
      case 'delete':
        if (this.conditionKey === null) return
        this.deleteCondition(this.conditionKey)
        break

      default:
        throw new Error('UNHANDLED ACTION')
    }
  },
  createCondition() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    const newButton = createMetaTemplateOutIn({
      node: localNodeData.value,
      socket: ReteSockets['condition'],
    })
    const postbackId = crypto.randomUUID()
    localNodeData.value.data.giver_data[newButton.key] = postbackId
    localNodeData.value.data.conditions.push({ ...this.form })
    toast({
      title: 'Condition Added',
      variant: 'success',
      duration: 2000,
    })
    this.changeIntent({ intent: 'default' })
  },
  updateCondition() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    if (!this.conditionKey) throw new Error('no conditionKey')

    localNodeData.value.data.conditions[this.conditionKey] = { ...this.form }

    toast({
      title: 'Condition Updated',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  deleteCondition(key) {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')

    localNodeData.value.data.conditions = [...localNodeData.value.data.conditions].filter(
      (_, index) => key !== index,
    )

    toast({
      title: 'Condition Deleted',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },

  intent: 'default',
  conditionKey: null,
  changeIntent(args) {
    this.intent = args.intent
    handleChangeState(args.intent)
  },
})

function handleRemoveDelay() {
  if (!localNodeData.value?.data) return

  localNodeData.value.data.delay = '0'

  toast({
    title: 'Removed delay',
    variant: 'success',
    duration: 2000,
  })
}
</script>

<template>
  <template v-if="localNodeData && localNodeData.data">
    <!-- default state -->
    <template v-if="sheetState === 'default'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <Icon
          :icon="nodeIconMapping[localNodeData.label]"
          class="row-span-full size-[var(--icon-size)] self-center"
        />
        <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">Condition</SheetDescription>
      </SheetHeader>
      <main class="grid gap-y-4 px-6 py-3 text-sm">
        <div>
          <Label for="name">Name</Label>
          <Input
            v-model:model-value="localNodeData.data.name"
            id="name"
            type="text"
            name="name"
            placeholder="What do you call this node?"
          />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Delay</h3>
            <button type="button" class="font-medium text-destructive" @click="handleRemoveDelay">
              Remove Delay
            </button>
          </div>
          <div class="flex items-center gap-x-4">
            <Input
              v-model:model-value="localNodeData.data.delay"
              id="delay"
              type="range"
              name="delay"
              min="0"
              max="10"
              default-value="0"
            />
            <span class="whitespace-nowrap">
              {{ localNodeData.data.delay ?? '0' }}
              seconds
            </span>
          </div>
        </div>
        <div class="grid gap-y-2">
          <h3 class="font-medium">Condition</h3>
          <RadioGroup default-value="all">
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="all" value="all" />
              <Label for="all">All conditions must be met</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="any" value="any" />
              <Label for="any">Any one of conditions met</Label>
            </div>
          </RadioGroup>
        </div>
        <div class="mt-2 grid gap-y-3 text-sm">
          <h3 class="font-medium">Condition List</h3>
          <ul class="grid gap-y-1.5 text-xs">
            <li
              v-for="(condition, key) in localNodeData.data.conditions"
              :key
              class="flex items-center justify-between"
            >
              {{ condition.label }}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span class="sr-only">open dropdown menu</span>
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem class="gap-x-2">
                    <Icon icon="bx:pencil" class="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-2">
                    <Icon icon="bx:trash" class="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
          <Button
            type="button"
            variant="ghost"
            class="w-full border-2 border-dashed text-muted-foreground"
            @click="conditionForm.changeIntent({ intent: 'create-condition' })"
          >
            Add Condition
          </Button>
        </div>
      </main>
    </template>

    <!-- create-condition-state -->
    <template v-else-if="sheetState === 'create-condition' || sheetState === 'edit-condition'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <button
          type="button"
          class="row-span-full self-center"
          @click="handleChangeState('default')"
        >
          <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
        </button>
        <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="handleChangeState('default')"
          >
            Condition
          </button>
          > Condition
        </SheetDescription>
      </SheetHeader>

      <form
        class="grid gap-y-4 px-6 py-3"
        @submit.prevent="conditionForm.submitForm($event as SubmitEvent)"
      >
        {{ conditionForm.form }}
        <div>
          <Label for="label">Condition Label</Label>
          <Input
            v-model:model-value="conditionForm.form.label"
            id="label"
            type="text"
            name="label"
            placeholder="How do you want to call this condition"
          />
        </div>
        <div>
          <Label for="type">Button Type</Label>
          <Select v-model:model-value="conditionForm.form.type" id="type" name="type">
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="one">Type #1</SelectItem>
                <SelectItem value="two">Type #2</SelectItem>
                <SelectItem value="three">Type #3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label for="qualifier">Qualifier</Label>
          <Select
            v-model:model-value="conditionForm.form.qualifier"
            id="qualifier"
            name="qualifier"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a qualifier" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="one">Qualifier #1</SelectItem>
                <SelectItem value="two">Qualifier #2</SelectItem>
                <SelectItem value="three">Qualifier #3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label for="value">Value</Label>
          <Input
            v-model:model-value="conditionForm.form.value"
            id="value"
            type="text"
            name="value"
            placeholder="Henry"
          />
        </div>
        <Button v-if="sheetState === 'create-condition'" type="submit" data-action="create">
          Add Condition
        </Button>
        <template v-else>
          <Button type="submit" data-action="update">Update Condition</Button>
          <Button type="submit" variant="destructive" data-action="delete">Remove Condition</Button>
        </template>
      </form>
    </template>
  </template>
</template>
