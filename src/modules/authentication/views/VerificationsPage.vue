<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router'
import EmailVerification from '../components/EmailVerification.vue';
const route = useRoute()

const mode = computed(() => route.query.mode)
const isVerifyEmail = computed(() => mode.value === 'verifyEmail')
</script>
<template>
    <div class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="max-w-md w-full bg-white rounded-xl p-6">
            <EmailVerification v-if="isVerifyEmail" />
        </div>
    </div>
</template>
