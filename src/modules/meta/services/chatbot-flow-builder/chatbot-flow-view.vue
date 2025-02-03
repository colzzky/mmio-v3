<template>
  <div>
    <!-- <FlowCanvas v-if="route.name === 'chatbot-flow'" />
        <FlowUpload v-else-if="route.name === 'chatbot-flow-upload'" />
        <Flow v-else-if="route.name === 'chatbot-flow-final'" /> -->
    <Flow />
  </div>
</template>

<script lang="ts" setup>
import Flow from './components/flow.vue'
</script>
