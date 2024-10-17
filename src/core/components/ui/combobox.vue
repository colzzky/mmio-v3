<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/core/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover'
import cn from '@/core/utils/cn'
import { ref } from 'vue'

defineProps<{
  model: string
  options: { value: string; label: string }[]
}>()
const emit = defineEmits(['select'])

const open = ref(false)
const value = ref('')
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="h-7 w-full justify-between ps-3 text-xs"
      >
        {{ value ? options.find((option) => option.value === value)?.label : `Select ${model}...` }}
        <i class="bx bxs-sort-alt ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="p-0">
      <Command>
        <CommandInput class="h-9" :placeholder="`Search ${model}...`" />
        <CommandEmpty>No {{ model }} found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              class="text-xs"
              @select="
                (ev) => {
                  if (typeof ev.detail.value === 'string') {
                    value = ev.detail.value
                    emit('select', value)
                  }
                  open = false
                }
              "
            >
              {{ option.label }}
              <i
                :class="
                  cn(
                    'bx bx-check ml-auto size-4',
                    value === option.value ? 'opacity-100' : 'opacity-0',
                  )
                "
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
