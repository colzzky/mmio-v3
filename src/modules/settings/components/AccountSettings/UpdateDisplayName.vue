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
import { Skeleton } from '@/core/components/ui/skeleton'
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
    dataInput: DataInput;
    errors: DataInput;
    validated: boolean;
    isLoading: boolean;
    confirmationModal: boolean;
    initializeValue: () => void;
    openCloseConfirmation: () => void;
    updateDisplayName: () => Promise<void>;
    validateDataInput: () => Promise<void>;
    validateSingleField: (field: keyof DataInput) => void;
}
type DefaultInputField = Pick<InputField, 'dataInput'>;

const componentLoad = ref<boolean>(true)

const schema = z.object({
    displayName: z.string().min(1, { message: "Display name is required" }),
});

const defaultInputField = <DefaultInputField>{
    dataInput: {}
}

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
    initializeValue() {
        //Get initial value
        if (user_auth.data && user_auth.data.displayName) {
            inputField.dataInput.displayName = user_auth.data.displayName
        } else {
            inputField.dataInput.displayName = ''
        }
        //get the default
        defaultInputField.dataInput = this.dataInput
    },
    validateSingleField(field: keyof DataInput): void {
        const value = this.dataInput[field]
        this.errors[field] = ''
        const result = schema.shape[field].safeParse(value);
        if (!result.success) {
            console.log(result.error.errors[0])
            this.errors[field] = result.error.errors[0].message;
        }
    },
    async validateDataInput(): Promise<void> {
        Object.keys(this.errors).forEach((key) => {
            const field = key as keyof DataInput;
            this.errors[field] = '';
        });
        
        const result = schema.safeParse(this.dataInput);

        // Set the validation result
        this.validated = result.success;

        if (!result.success) {
            result.error.errors.forEach(err => {
                const field = err.path[0] as keyof DataInput;
                this.errors[field] = err.message;
            });
        }
        
        if (this.validated) {
            this.openCloseConfirmation();
        }
    },
    openCloseConfirmation(): void {
        this.confirmationModal = !this.confirmationModal;
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
            //Set default
            defaultInputField.dataInput = this.dataInput
        } else {
            toast({
                title: 'Display Name update error',
                description: 'Something went wrong please try again',
                variant: 'destructive',
            })
            //Option to return to default value when needed.
        }
        this.isLoading = false
        this.openCloseConfirmation()
    },
});

onMounted(() => {
    componentLoad.value = true
    inputField.initializeValue()
    componentLoad.value = false
})
</script>

<template>
    <div v-if="!componentLoad" class="flex flex-col gap-y-2">
        <Label for="name" class="text-xs">Display Name</Label>
        <div class="flex gap-2 items-center">
            <Input v-model="inputField.dataInput.displayName" type="text" name="name" id="name" placeholder="John Doe"
                class="h-7 text-xs" @blur="inputField.validateSingleField('displayName')" />
            <Button size="xs" class="text-xs" @click="inputField.validateDataInput()">Update</Button>
        </div>
        <div v-if="inputField.errors.displayName" for="name" class="text-xs text-red-500 flex items-center gap-1">
            <i class="material-icons text-sm">error</i>
            {{ inputField.errors.displayName }}
        </div>
    </div>
    <div v-else class="flex flex-col gap-y-2">
        <Skeleton class="h-2 w-[100px] rounded-full bg-gray-300" />
        <div class="flex gap-2 items-center">
            <Skeleton class="h-3 w-full rounded-full bg-gray-300" />
        </div>
        <Skeleton class="h-3 w-[300px] bg-gray-300" />
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
