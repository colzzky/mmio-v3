<script setup lang="ts">
import { Button } from '../components/ui/button'
import { uiHelpers } from '../utils/ui-helper'
import { links, links as sidebarLinks } from '@/modules/settings/routes'

const distinctSections = Array.from(new Set(sidebarLinks.map((link) => link.section)))
const linksBySection = new Map(
  distinctSections.map((section) => [section, links.filter((link) => link.section === section)]),
)
</script>

<template>
  <div
    class="mx-auto grid w-[calc(100svw-calc(var(--gutter)*2))] max-w-screen-xl grid-cols-[minmax(250px,300px)_1fr] gap-8 py-[var(--gutter)] [--gutter:theme(spacing.4)]"
  >
    <header class="col-span-2 flex items-center justify-between border-b py-2">
      <span class="flex items-center gap-x-2 text-xl font-bold">
        <i class="material-icons text-5xl">pin</i>
        Settings
      </span>
      <Button variant="secondary" as-child>
        <RouterLink to="/">Return</RouterLink>
      </Button>
    </header>
    <aside class="col-span-1 flex flex-col gap-y-4">
      <section
        v-for="[section, links] in linksBySection"
        :key="section"
        class="flex flex-col gap-y-2"
      >
        <h2 class="text-sm font-bold">{{ uiHelpers.toTitleCase(section) }}</h2>
        <div class="flex flex-col gap-y-1">
          <RouterLink
            v-for="link in links"
            :key="link.href"
            :to="link.href"
            class="grid grid-cols-[var(--icon-size),1fr] items-center gap-x-4 rounded px-4 py-2.5 text-sm font-medium transition-colors [--icon-size:20px] hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            <i :class="['bx text-[length:var(--icon-size)]', link.icon]" />
            {{ link.label }}
          </RouterLink>
        </div>
      </section>
    </aside>
    <slot />
  </div>
</template>
