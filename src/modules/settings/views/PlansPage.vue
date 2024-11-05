<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
</script>

<template>
  <main class="flex flex-col gap-y-12">
    <section class="flex flex-col gap-y-2">
      <h2 class="ms-6 font-bold">Active Plan</h2>
      <div class="flex items-center justify-between rounded-xl bg-muted p-6">
        <div class="flex flex-col gap-y-2">
          <div class="flex items-center gap-x-2">
            <strong>Apprentice</strong>
            <span>&bullet;</span>
            <small>$15 per month</small>
          </div>
          <p class="text-sm">For first timers who want to try our services</p>
        </div>
        <Button>Downgrade</Button>
      </div>
    </section>
    <section
      class="grid grid-cols-[min(125px)_repeat(4,minmax(0,1fr))] grid-rows-[1fr_fit-content_1fr_1fr] gap-x-8 p-6 text-sm xl:gap-x-12 2xl:gap-x-16 [&>div]:row-start-2 [&>div]:row-end-5 [&>div]:grid [&>div]:grid-rows-subgrid"
    >
      <h2 class="col-start-1 gap-y-2 text-base font-bold">All Plans</h2>
      <div class="col-start-2">
        <h3 class="text-lg font-bold">FREE</h3>
        <ul class="mb-6 list-inside list-disc">
          <li>$0 per month</li>
        </ul>
        <Button size="sm" class="self-start">Downgrade</Button>
      </div>
      <div class="col-start-3">
        <h3 class="text-lg font-bold">Apprentice</h3>
        <ul class="mb-6 list-inside list-disc">
          <li>$15 per month / billed annually</li>
        </ul>
      </div>
      <div class="col-start-4">
        <h3 class="text-lg font-bold">Grand Master</h3>
        <ul class="mb-6 list-inside list-disc">
          <li>$55 per month / billed annually</li>
        </ul>
        <Button size="sm" class="self-start">Upgrade</Button>
      </div>
      <div class="col-start-5">
        <h3 class="text-lg font-bold">Sage</h3>
        <ul class="mb-6 list-inside list-disc">
          <li>$195 per month / billed annually</li>
        </ul>
        <Button size="sm" class="self-start">Upgrade</Button>
      </div>
    </section>
    <section
      class="grid grid-cols-[min(125px)_repeat(4,minmax(0,1fr))] gap-x-8 rounded-xl bg-muted p-6 text-sm xl:gap-x-12 2xl:gap-x-16"
    >
      <h2 class="gap-y-2 text-base font-bold">Our Services</h2>
      <ul class="list-disc">
        <li>Lorem ipsum odor amet, consectetuer adipiscing elit.</li>
        <li>Porta mollis bibendum ullamcorper dapibus porttitor, class viverra pellentesque.</li>
        <li>Hac nibh quis ante arcu varius facilisis magnis.</li>
        <li>Himenaeos class mattis eu hendrerit at arcu porttitor.</li>
        <li>Interdum commodo velit; erat integer nunc sapien.</li>
      </ul>
      <ul class="list-disc">
        <li>Lorem ipsum odor amet, consectetuer adipiscing elit.</li>
        <li>Porta mollis bibendum ullamcorper dapibus porttitor, class viverra pellentesque.</li>
        <li>Hac nibh quis ante arcu varius facilisis magnis.</li>
        <li>Himenaeos class mattis eu hendrerit at arcu porttitor.</li>
        <li>Interdum commodo velit; erat integer nunc sapien.</li>
      </ul>
      <ul class="list-disc">
        <li>Lorem ipsum odor amet, consectetuer adipiscing elit.</li>
        <li>Porta mollis bibendum ullamcorper dapibus porttitor, class viverra pellentesque.</li>
        <li>Hac nibh quis ante arcu varius facilisis magnis.</li>
        <li>Himenaeos class mattis eu hendrerit at arcu porttitor.</li>
        <li>Interdum commodo velit; erat integer nunc sapien.</li>
      </ul>
      <ul class="list-disc">
        <li>Lorem ipsum odor amet, consectetuer adipiscing elit.</li>
        <li>Porta mollis bibendum ullamcorper dapibus porttitor, class viverra pellentesque.</li>
        <li>Hac nibh quis ante arcu varius facilisis magnis.</li>
        <li>Himenaeos class mattis eu hendrerit at arcu porttitor.</li>
        <li>Interdum commodo velit; erat integer nunc sapien.</li>
      </ul>
    </section>
  </main>
</template>
