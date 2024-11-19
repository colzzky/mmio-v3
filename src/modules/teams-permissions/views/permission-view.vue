<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const team_id = route.params.permission_id
onMounted(()=>{
    console.log('hello')
})
</script>
<template>
    <div>
        Hi
        {{ team_id }}
    </div>
</template>