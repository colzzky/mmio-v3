<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'

const useProject = useProjectStore()
const { workspace_data } = useProject
</script>

<template>
  <DefaultLayout>
    <main lass="container mx-auto">
      this is meta home page
      <div>Data</div>
      <div>
        {{ workspace_data.data }}
      </div>
    </main>
  </DefaultLayout>
</template>
