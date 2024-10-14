<template>
    <Toaster />
    <div>
        <h2 class="text-2xl font-bold text-center mb-4">Email Verified!</h2>
        <p class="text-gray-700 mb-4">
            Thank you for signing up with Marketing Master IO! Your email is now verified
        </p>
        <div class="text-center">
            <Button variant="link" class="h-[unset] p-0 text-red-500"> Return to login</Button>
        </div>
        <p class="text-gray-600 text-sm text-center mt-4">
            Don't have an account?, <Button variant="link" class="h-[unset] p-0 text-blue-500"> click here </Button> to
            register.
        </p>
    </div>
</template>

<script setup>
import { Button } from '@/core/components/ui/button'
import { Toaster } from '@/core/components/ui/toast'
import { useToast } from '@/core/components/ui/toast/use-toast'
import { applyActionCode, getAuth } from 'firebase/auth'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/core/utils/firebase-client'

const { toast } = useToast()
const route = useRoute()
const router = useRouter()
onMounted(async () => {
    await verifyEmail()
})

const verifyEmail = async () => {
    const actionCode = typeof route.query.oobCode === 'string' ? route.query.oobCode : ''
    if (actionCode) {
        await applyActionCode(auth, actionCode)
            .then(() => {
                console.log(auth)
                toast({
                    title: 'Email Verification',
                    description: 'Email verification was successfuly',
                    variant: 'success',
                })
            })
            .catch(() => {
                toast({
                    title: 'Email Verification Error',
                    description: 'Invalid Email Verification Link',
                    variant: 'destructive',
                })
                router.push({ name: 'login' })
            })
    } else {
        console.log('Email Verification Error: ' + 'Invalid Email Verification link')

        toast({
            title: 'Email Verification Error',
            description: 'Invalid Email Verification Link',
            variant: 'destructive',
        })

        router.push({ name: 'login' })
    }
}
</script>

<style scoped></style>