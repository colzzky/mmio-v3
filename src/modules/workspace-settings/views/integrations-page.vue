<script setup lang="ts">
import ImportIntegrationModal from '../components/import-integration-modal.vue'
import { options, integrations } from '../temporaries'
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/core/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import { uiHelpers } from '@/core/utils/ui-helper'
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const selectedOption = computed(() =>
  options.find(({ identifier }) => route.query.selectedOptionQuery === identifier),
)

const importIntegrationModalRef = useTemplateRef('importIntegrationModal')
</script>

<template>
  <section v-if="!selectedOption">
    <ul
      class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] grid-rows-[1fr_fit-content_1fr_1fr] gap-4"
    >
      <li
        v-for="option in options"
        :key="option.identifier"
        :value="option.title"
        class="row-span-4 grid grid-rows-subgrid gap-y-0 rounded-md border bg-primary/5 p-4"
      >
        <div class="flex items-center gap-x-2 text-lg font-bold">
          <i :class="['bx text-2xl', option.icon]" />
          <h2>
            {{ option.title }}
          </h2>
        </div>
        <p class="text-xs">{{ option.description }}</p>
        <div class="mt-4 text-sm font-medium">
          {{ integrations[option.identifier].length }} Integrations
        </div>
        <RouterLink
          class="mt-4 justify-self-end text-sm font-medium text-blue-500 hover:underline"
          :to="{ query: { selectedOptionQuery: option.identifier } }"
        >
          View linked {{ option.title }}
        </RouterLink>
      </li>
    </ul>
  </section>
  <section v-else class="grid gap-y-4">
    <div class="flex items-center justify-between">
      <RouterLink :to="{ query: {} }" class="flex items-center gap-x-2 font-bold">
        <i class="material-icons">keyboard_return</i>
        {{ selectedOption.title }}
      </RouterLink>
      <Button @click="importIntegrationModalRef?.modal.open(selectedOption.title)">
        Import {{ selectedOption.title }}
      </Button>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Imported At</TableHead>
          <TableHead>Imported By</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="(integration, index) in integrations[selectedOption.identifier]"
          :key="index"
        >
          <TableCell>{{ integration.name }}</TableCell>
          <TableCell>
            {{ uiHelpers.formatDateTimeAgo(integration.importedAt.toDateString()) }}
          </TableCell>
          <TableCell>{{ integration.importedBy }}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span class="sr-only">Open Integrations Menu</span>
                <i class="bx bx-dots-vertical-rounded text-xl" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem class="gap-x-3">
                  <i class="bx bx-info-circle text-xl" />
                  Page Information
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-x-3">
                  <i class="bx bxs-toggle-right text-xl" />
                  Activate
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-x-3">
                  <i class="bx bx-log-in text-xl" />
                  Reauthenticate
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-x-3">
                  <i class="bx bx-trash text-xl" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </section>

  <ImportIntegrationModal ref="importIntegrationModal" />
</template>
