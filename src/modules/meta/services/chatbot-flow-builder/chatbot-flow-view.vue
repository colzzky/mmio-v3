<template>
    <div>
        <FlowCanvas v-if="route.name === 'chatbot-flow'" />
        <FlowUpload v-else-if="route.name === 'chatbot-flow-upload'" />
        <Flow v-else-if="route.name === 'chatbot-flow-final'" />
    </div>
</template>

<script lang="ts" setup>
import FlowCanvas from './components/flow-canvas.vue';
import FlowUpload from './components/flow-canvas-populate.vue';
import Flow from './components/flow.vue';
import { useRoute } from 'vue-router';
const route = useRoute()
</script>