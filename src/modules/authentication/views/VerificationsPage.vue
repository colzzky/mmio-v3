<script lang="ts" setup>
import EmailVerification from '../components/EmailVerification.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const mode = computed(() => route.query.mode)
const isVerifyEmail = computed(() => mode.value === 'verifyEmail')
</script>
<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-xl bg-white p-6">
      <EmailVerification v-if="isVerifyEmail" />
    </div>
  </div>
</template>
