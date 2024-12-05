<template>
  <div ref="pickerRef" class="relative space-y-2">
    <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="0 relative mt-2 flex items-center rounded-md">
      <Input
        type="text"
        :placeholder="placeholder"
        :value="formattedTime"
        readonly
        @focus="openDropdown"
      />
      <i class="material-icons pointer-events-none absolute right-2 text-gray-500">schedule</i>
    </div>

    <!-- Dropdown -->
    <div
      v-show="dropdownVisible"
      class="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg"
    >
      <div class="flex justify-between space-x-4 px-3 py-2">
        <!-- Hours Dropdown -->

        <Select v-model:model-value="selectedMinute" class="block w-1/2">
          <SelectTrigger>
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select v-model:model-value="selectedMinute" class="block w-1/2">
          <SelectTrigger>
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="minute in minutes" :key="minute" :value="minute">{{
                minute
              }}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <!-- Submit Button -->
      <Button @click="setTime" class="block w-full"> Set Time </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from './button/Button.vue'
import Input from './input/Input.vue'
import Select from './select/Select.vue'
import SelectContent from './select/SelectContent.vue'
import SelectGroup from './select/SelectGroup.vue'
import SelectItem from './select/SelectItem.vue'
import SelectTrigger from './select/SelectTrigger.vue'
import SelectValue from './select/SelectValue.vue'
import { ref, computed, watch, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'

// Props and Emits
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Select Time',
  },
  placeholder: {
    type: String,
    default: 'HH:MM',
  },
})

const modelVal = ref(props.modelValue)
const placeholderV = ref(props.placeholder)

const emit = defineEmits(['update:modelValue'])

// Refs for component state
const dropdownVisible = ref(false)
const selectedHour = ref<string>('')
const selectedMinute = ref<string>('')

// Computed properties for hours and minutes
const hours = computed(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')))
const minutes = computed(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')))

// Computed property for formatted time
const formattedTime = computed(() => modelVal.value || placeholderV.value)

// Reference to the component DOM element
const pickerRef = ref<HTMLDivElement | null>(null)

// Open the dropdown
const openDropdown = () => {
  dropdownVisible.value = true
}

// Set time and emit value
const setTime = () => {
  if (selectedHour.value && selectedMinute.value) {
    const time = `${selectedHour.value}:${selectedMinute.value}`
    emit('update:modelValue', time)
    dropdownVisible.value = false
  } else {
    alert('Please select both hours and minutes.')
  }
}

// Close dropdown on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (pickerRef.value && !pickerRef.value.contains(event.target as Node)) {
    dropdownVisible.value = false
  }
}

// Watch for changes in `modelValue`
watch(
  () => modelVal.value,
  (newValue) => {
    if (newValue) {
      const [hour, minute] = newValue.split(':')
      selectedHour.value = hour || ''
      selectedMinute.value = minute || ''
    }
  },
  { immediate: true },
)

// Add and remove event listener for outside click
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
/* Add your custom styles here if needed */
</style>
