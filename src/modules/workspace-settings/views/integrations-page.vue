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
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import { uiHelpers } from '@/core/utils/ui-helper'
import router from '@/router'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { identity } from '@vueuse/core'
import { computed, reactive, useTemplateRef, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const authWorkspaceStore = useAuthWorkspaceStore()
const { current_meta_pages, active_workspace} = authWorkspaceStore

interface Identifier {
  identifier: string
  title: string
  icon: string
  description: string
}

const route = useRoute()
const selectedOption = reactive({
  selected: <Identifier | null>null,
  async initialize_identifier(identifier: Identifier | null) {
    identifier ? this.selected = identifier : this.selected = null
    identifier ? router.push({
      query: { selectedOptionQuery: identifier.identifier },
      replace: true
    }) : router.push({
      query: { selectedOptionQuery: null },
      replace: true
    })

    if(identifier && identifier.identifier === 'meta_pages'){
      await current_meta_pages.fetch_meta_pages()
      console.log(active_workspace.data)
    }
  }
})

onMounted(async() => {
  if (route.query.selectedOptionQuery) {
    const find_identified = options.find(option => route.query.selectedOptionQuery === option.identifier)
    if (find_identified) {
      selectedOption.initialize_identifier(find_identified)
    } else {
      router.push({
        query: { selectedOptionQuery: null },
        replace: true
      })
    }
  }
  
})

const importIntegrationModalRef = useTemplateRef('importIntegrationModal')
</script>

<template>
  <div class="container mx-auto mt-4">
    <section v-if="!selectedOption.selected">
      <ul class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] grid-rows-[1fr_fit-content_1fr_1fr] gap-8">
        <li v-for="option in options" :key="option.identifier" :value="option.title"
          class="row-span-4 grid grid-rows-subgrid gap-y-0 rounded-md border bg-primary/5 p-4">
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
          <Button variant="link" class="p-0 mt-4 justify-self-end text-sm font-medium text-blue-500"
            @click="selectedOption.initialize_identifier(option)">
            View linked {{ option.title }}
          </Button>
        </li>
      </ul>
    </section>
    <section v-else class="grid gap-y-4">
      <div class="flex items-center justify-between">
        <span @click="selectedOption.initialize_identifier(null)"
          class="flex items-center gap-x-2 font-bold cursor-pointer">
          <i class="material-icons">keyboard_return</i>
          {{ selectedOption.selected.title }}
        </span>
        <Button @click="importIntegrationModalRef?.modal.open(selectedOption.selected.title)">
          Import {{ selectedOption.selected.title }}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Updated At:</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody v-if="!current_meta_pages.isLoading">
          <TableRow v-for="(integration, index) in current_meta_pages.data" :key="index">
            <TableCell>{{ integration.name }}</TableCell>
            <TableCell>
              {{ uiHelpers.formatDateTimeAgo(integration.updatedAt) }}
            </TableCell>
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
        <TableBody v-else>
          <TableRow>
            <TableCell><Skeleton class="h-3 w-[full] rounded-full bg-gray-300" /></TableCell>
            <TableCell><Skeleton class="h-3 w-[full] rounded-full bg-gray-300" /></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  </div>

  <ImportIntegrationModal ref="importIntegrationModal"/>
</template>
