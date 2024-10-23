<script setup lang="ts">
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import { useProjectStore } from '@/stores/projectStore'

const useProject = useProjectStore()
const { project_data } = useProject
</script>

<template>
  <DefaultLayout>
    <main lass="container mx-auto">
      this is meta home page
      <div>Data</div>
      <div>
        {{ project_data.data }}
      </div>
    </main>
  </DefaultLayout>
</template>
