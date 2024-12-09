<template>
    <div>
        <FlowCanvas v-if="route.name === 'chatbot-flow'" />
        <FlowUpload v-else-if="route.name === 'chatbot-flow-upload'" />
    </div>
</template>

<script lang="ts" setup>
import FlowCanvas from './components/flow-canvas.vue';
import FlowUpload from './components/flow-canvas-populate.vue';
import { useRoute } from 'vue-router';
const route = useRoute()
</script>