<script setup lang="ts">
import { Card } from '@/core/components/ui/card'
import { Separator } from '@/core/components/ui/separator'
</script>

<template>
  <Card class="w-full max-w-screen-lg justify-self-center bg-primary/5">
    <section class="grid gap-y-4 p-8">
      <div>
        <h2 class="text-lg/none font-bold">Workspace</h2>
        <p class="text-xs">This settings reveals your workspace information</p>
      </div>
      <div class="grid grid-cols-[1fr_max-content] gap-x-4 text-xs">
        <dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 [&>dd]:font-medium">
          <dd>Workspace Name:</dd>
          <dt>Labi mo Labi ko Project</dt>
          <dd>Workspace ID:</dd>
          <dt>21213-12312312-3123-1231231</dt>
          <dd>Owner:</dd>
          <dt>Marketing Master IO</dt>
          <dd>Owner's Email:</dd>
          <dt>mmiov3@gmail.com</dt>
        </dl>
        <button type="button" class="self-start text-blue-500 hover:underline">Change Name</button>
      </div>
    </section>
    <Separator />
    <section class="grid gap-y-4 p-8">
      <div>
        <h2 class="text-lg/none font-bold">Team</h2>
        <p class="text-xs">
          This settings reveals your team information who handles this workspace
        </p>
      </div>
      <div class="grid grid-cols-[1fr_max-content] gap-x-4 text-xs">
        <dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 [&>dd]:font-medium">
          <dd>Team Name:</dd>
          <dt>Labi Mo Team</dt>
          <dd>Workspace ID:</dd>
          <dt>21213-12312312-3123-1231231</dt>
        </dl>
        <button type="button" class="self-start text-blue-500 hover:underline">Manage Team</button>
      </div>
    </section>
  </Card>
</template>
