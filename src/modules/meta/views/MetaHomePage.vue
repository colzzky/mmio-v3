<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'

const useProject = useProjectStore()
const { project_data } = useProject
</script>

<template>
  <main lass="container mx-auto">
    this is meta home page
    <div>Data</div>
    <div>
      {{ project_data.data }}
    </div>
  </main>
</template>
