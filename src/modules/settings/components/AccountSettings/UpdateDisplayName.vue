<script setup lang="ts">
import { z } from 'zod';
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/core/components/ui/dialog'
import { onMounted, reactive, ref } from 'vue'
import { useToast, Toaster } from '@/core/components/ui/toast'
import { useAuthStore } from '@/stores/authStore';
import { updateProfile } from 'firebase/auth';
const { toast } = useToast()
const useAuth = useAuthStore()
const { user_auth } = useAuth

interface DataInput {
    displayName: string
}
interface InputField {
    dataInput: DataInput
    errors: DataInput
    validated: boolean
    isLoading: boolean
    confirmationModal: boolean
    openCloseConfirmation: () => void
    updateDisplayName: () => Promise<void>
}
type ValidationInputField = Pick<InputField, 'dataInput' | 'errors' | 'validated'>;

onMounted(() => {
    //get the date from firebase first the displayname
    if (user_auth.data && user_auth.data.displayName) {
        inputField.dataInput.displayName = user_auth.data.displayName
    }else{
        inputField.dataInput.displayName = ''
    }
})

const inputField = reactive<InputField>({
    dataInput: {
        displayName: 'test@example.com',
    },
    errors: {
        displayName: '',
    },
    validated: false,
    isLoading: false,
    confirmationModal: false,
    openCloseConfirmation() {
        if (this.confirmationModal) {
            this.confirmationModal = false
        } else {
            this.confirmationModal = true
        }
    },
    async updateDisplayName() {
        this.isLoading = true
        user_auth.checkUser()
        if (user_auth.data) {
            await updateProfile(user_auth.data, { displayName: this.dataInput.displayName });
            toast({
                title: 'Display Name Updated',
                description: 'You have succssfully updated your display name',
                variant: 'success',
            })
        } else {
            toast({
                title: 'Display Name update error',
                description: 'Something went wrong please try again',
                variant: 'destructive',
            })
        }
        this.isLoading = false
        this.openCloseConfirmation()
    }
});

const schema = z.object({
    displayName: z.string().min(1, { message: "Display name is required" }),
});

function validateInputField() {
    const result = schema.safeParse(inputField.dataInput);

    Object.keys(inputField.errors as DataInput).forEach((key) => {
        const index = key as keyof DataInput
        inputField.errors[index] = ''
    });
    inputField.validated = result.success;

    if (!result.success) {
        result.error.errors.forEach(err => {
            const field = err.path[0] as keyof DataInput;
            inputField.errors[field] = err.message;
        });
    }

    if (inputField.validated) {
        inputField.openCloseConfirmation()
    }
}

function validateSingleField(field: keyof DataInput): void {
    const value = inputField.dataInput[field]
    inputField.errors[field] = ''
    const result = schema.shape[field].safeParse(value);
    if (!result.success) {
        console.log(result.error.errors[0])
        inputField.errors[field] = result.error.errors[0].message;
    }
}

const confirmationModal = ref<boolean>(false)
const openCloseModal = () => {

}
</script>

<template>
    <div class="flex flex-col gap-y-2">
        <Label for="name" class="text-xs">Display Name</Label>
        <div class="flex gap-2 items-center">
            <Input v-model="inputField.dataInput.displayName" type="text" name="name" id="name" placeholder="John Doe"
                class="h-7 text-xs" @blur="validateSingleField('displayName')" />
            <Button size="xs" class="text-xs" @click="validateInputField()">Update</Button>
        </div>
        <div v-if="inputField.errors.displayName" for="name" class="text-xs text-red-500 flex items-center gap-1">
            <i class="material-icons text-sm">error</i>
            {{ inputField.errors.displayName }}
        </div>
    </div>
    <!-- Modal For Confirming Display name  -->
    <Toaster />
    <Dialog v-model:open="inputField.confirmationModal">
        <DialogContent @interact-outside="(e) => e.preventDefault()">
            <div class="relative">
                <button @click="inputField.openCloseConfirmation()"
                    class="absolute right-0 top-0 cursor-pointer border-0 bg-transparent text-xl text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close">
                    <i class="material-icons">close</i>
                </button>
            </div>
            <div>
                <DialogHeader class="pb-4">
                    <DialogTitle class="text-xl font-bold">Confirm Changes?</DialogTitle>
                </DialogHeader>
                <span class="text-sm">You're about to update your profile. Are you sure about this changes?</span>
                <DialogFooter class="pt-4">
                    <div>
                        <div v-if="!inputField.isLoading" class="flex items-center justify-end gap-2">
                            <Button variant="outline" size="xs" @click="inputField.openCloseConfirmation()"> Cancel
                            </Button>
                            <Button variant="outline" size="xs" @click="inputField.updateDisplayName()"> Confirm
                            </Button>
                        </div>
                        <div v-else class="flex items-center justify-end gap-2">
                            <Button variant="outline" size="xs" disabled class="flex gap-2 items-center">
                                <i class="material-icons text-sm animate-spin">donut_large</i>Loading....
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>


</template>
