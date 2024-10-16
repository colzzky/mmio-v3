<script setup lang="ts">
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
const useProject = useProjectStore()
const {project_data} = useProject
const useAuth = useAuthStore()
const route = useRoute();
const router = useRouter();
const pageLoad = ref<boolean>(true)

onMounted(async()=>{
  pageLoad.value = true
  const pj_id = route.params.pj_id
  if(pj_id){
    if(!project_data.data || !project_data.isInitialized){
      const get = await project_data.get(pj_id as string)
      if(get.status){
        project_data.set(get.data)
        console.log(project_data.data)
      }else{
        console.log('id invalid')
        router.push({name:'home'}) 
      }
    }else{
      if(pj_id != project_data.data.pj_id){
        console.log('id does not match')
        router.replace({name:'home'}) 
      }
    }
  }else{
    console.log('Page does not exist')
    router.replace({name:'home'}) 
  }
  pageLoad.value = false
})

</script>

<template>
  <DefaultLayout>
    <main v-if="!pageLoad">this is meta home page</main>
    <main v-else>Loading.....</main>
  </DefaultLayout>
</template>
