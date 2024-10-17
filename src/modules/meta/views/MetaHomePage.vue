<script setup lang="ts">
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import { useProjectStore } from '@/stores/projectStore'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const useProject = useProjectStore()
const { project_data } = useProject
const route = useRoute()
const router = useRouter()
const pageLoad = ref<boolean>(true)


</script>

<template>
  <DefaultLayout>
    <main  lass="container mx-auto">
      this is meta home page
      <div>Data</div>
      <div>
        {{ project_data.data }}
      </div>
    </main>
  </DefaultLayout>
</template>
