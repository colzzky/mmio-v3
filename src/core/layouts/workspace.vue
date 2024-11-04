<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Button } from '@/core/components/ui/button'
import { Card } from '@/core/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
</script>

<template>
  <header class="p-4">
    <Card class="flex items-center gap-x-2 bg-primary/5 px-4 py-2">
      <div class="flex grow flex-col gap-y-1">
        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center self-start text-xs/4 font-bold">
            Marketing Master IO Page
            <i class="material-icons">arrow_drop_down</i>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item #1</DropdownMenuItem>
            <DropdownMenuItem>Item #2</DropdownMenuItem>
            <DropdownMenuItem>Item #3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <!-- <Breadcrumb>
              <BreadcrumbList class="text-xs/4">
                <BreadcrumbItem v-for="breadcrumb in breadcrumbs" :key="breadcrumb">
                  <BreadcrumbLink v-if="breadcrumb !== route.name" as-child>
                    <RouterLink :to="{ name: breadcrumb }">
                      {{ uiHelpers.toTitleCase(breadcrumb) }}
                    </RouterLink>
                  </BreadcrumbLink>
                  <BreadcrumbPage v-else>
                    {{ uiHelpers.toTitleCase(breadcrumb) }}
                  </BreadcrumbPage>
                  <BreadcrumbSeparator v-if="breadcrumb !== breadcrumbs[breadcrumbs.length - 1]" />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> -->
      </div>
      <Button variant="ghost" size="xs">
        <i class="material-icons text-md">keyboard_return</i>
      </Button>
      <Button variant="ghost" size="xs">
        <i class="material-icons text-md">notifications</i>
      </Button>
      <Avatar>
        <AvatarImage src="https://placehold.co/48" />
        <AvatarFallback>UI</AvatarFallback>
      </Avatar>
    </Card>
  </header>

  <RouterView />
</template>
