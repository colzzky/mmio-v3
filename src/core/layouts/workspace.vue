<script setup lang="ts">
import DesktopSidebar from '@/core/components/sidebar/desktop-sidebar.vue'
</script>

<template>
  <DesktopSidebar />
  <div class="lg:pl-72">
    <RouterView />
  </div>
</template>
