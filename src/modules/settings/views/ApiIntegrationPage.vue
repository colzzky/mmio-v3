<script setup lang="ts">
import SettingsLayout from '@/core/layouts/SettingsLayout.vue';
import { loadFacebookSDK } from '@/core/utils/facebook-sdk';
import { Button } from '@/core/components/ui/button'
import { ref, watch } from 'vue';
import generalAxiosInstance from '@/core/utils/general-axios-instance';
const fb_data = ref<fb.StatusResponse | null>(null)
const fb_clientCode = ref<string>('')
interface FBRRedeemClientCodeReturn {
    access_token: string,
    expires_in: number,
    machine_id: string
}
const fb_longlived_data = ref<FBRRedeemClientCodeReturn>({
    access_token: '',
    expires_in: 0,
    machine_id: ''
})

const fb_page_list = ref([])


// Handle Facebook login
const facebookLogin = async (): Promise<void> => {
    fb_clientCode.value = ''
    try {
        const FB = await loadFacebookSDK();
        const scopes = 'email,public_profile,pages_show_list,pages_read_engagement'; // Add page permissions here
        FB.login((response: fb.StatusResponse) => {
            if (response.authResponse) {
                console.log('User logged in with Facebook:', response);
                fb_data.value = response
            } else {
                console.error('User cancelled login or did not fully authorize.');
                fb_data.value = null
            }
        }, { scope: scopes });
    } catch (error) {
        console.error('Error loading Facebook SDK:', error);
        fb_data.value = null
    }
};


//!!!!NOTE THIS SHOULD BE IN Backend. For now we put this here to test data
//It should be also save in the firestore
async function exchangeForUserLongLivedToken(shortLivedToken: string) {
    interface FBTokenReturn {
        access_token: string,
        token_type: string,
        expires_in: number
    }
    const {
        APP_FACEBOOK_ID,
        APP_FACEBOOK_SECRET
    } = import.meta.env

    const url = `https://graph.facebook.com/v21.0/oauth/access_token?  
    grant_type=fb_exchange_token&          
    client_id=${APP_FACEBOOK_ID}&
    client_secret=${APP_FACEBOOK_SECRET}&
    fb_exchange_token=${shortLivedToken}`

    try {
        const response = await generalAxiosInstance.get(url);
        const fbReturn = response.data as FBTokenReturn
        return fbReturn
    } catch (error) {
        console.error('Error during token exchange:', error);
        return null
    }
}

async function exchangeForClientCode(longLivedToken: string) {
    interface FBClientCodeReturn {
        code: string,
    }
    const {
        APP_FACEBOOK_ID,
        APP_FACEBOOK_SECRET
    } = import.meta.env

    const url = `https://graph.facebook.com/v21.0/oauth/client_code?             
    client_id=${APP_FACEBOOK_ID}&
    client_secret=${APP_FACEBOOK_SECRET}&
    access_token=${longLivedToken}`;

    //redirect_uri={app-redirect-uri}& <-- Add this only for webhooks for now not needed

    try {
        const response = await generalAxiosInstance.get(url);
        const data = response.data as FBClientCodeReturn
        return data
    } catch (error) {
        console.error('Error during token exchange:', error);
        return null
    }
}


async function redeemClientCode(clientCode: string, machine_id: string = '') {
    const {
        APP_FACEBOOK_ID,
    } = import.meta.env

    const url = `https://graph.facebook.com/v21.0/oauth/access_token?   
    code=${clientCode}&
    client_id=${APP_FACEBOOK_ID}&
    machine_id= ${machine_id}`;

    //redirect_uri={app-redirect-uri}& <-- Add this only for webhooks for now not needed

    try {
        const response = await generalAxiosInstance.get(url);
        const data = response.data as FBRRedeemClientCodeReturn
        return data
    } catch (error) {
        console.error('Error during token exchange:', error);
        return null
    }
}



// Function to fetch user pages
async function fetchPages() {

    try {
        const response = await generalAxiosInstance.get(`https://graph.facebook.com/me/accounts?access_token=${fb_longlived_data.value.access_token}`);
        fb_page_list.value = response.data.data as any
    } catch (error) {
        console.error('Error fetching pages:', error);
    }
}
const isLoggedIn = ref(false);
//Check if the user is still logged in
const checkLoginStatus = async () => {
    const FB = await loadFacebookSDK();
    FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
            // User is logged in and authenticated
            isLoggedIn.value = true;
            console.log('User is logged in:', response);
            // You can call API to fetch user pages or perform other actions here
            FB.api('/me/accounts', (response) => {
                console.log('User Pages:', response);
            });
        } else if (response.status === 'not_authorized') {
            // User is logged into Facebook but not your app
            isLoggedIn.value = false;
            console.log('User is logged into Facebook but not the app.');
        } else {
            // User is not logged into Facebook
            isLoggedIn.value = false;
            console.log('User is not logged into Facebook.');
        }
    });
};


watch(fb_data, async (newValue, oldValue) => {
    if (newValue?.authResponse?.accessToken) {
        const longLived = await exchangeForUserLongLivedToken(newValue.authResponse.accessToken);
        const clientCode = longLived ? await exchangeForClientCode(longLived.access_token) : null;
        const redeem = clientCode ? await redeemClientCode(clientCode.code, fb_longlived_data.value.machine_id) : null;
        if (redeem) {
            fb_longlived_data.value = redeem
        }
        console.log(fb_longlived_data.value)
    }
    // You can perform additional actions here
});


//Setp by step process
//Login with a facebook account
//Once logged in save fb id and information to firstore (With this we can validate if the user is logging in with a different account)
//When logged in it will return the pages/account you want to import
//Then save these pages
//When the user need to import more he/she needs to sign in with the same fb id or user information he used before

</script>
<template>
    <SettingsLayout>
        <div class="flex flex-col gap-3">
            FB Data Pages
            <div>
                {{ fb_page_list }}
            </div>
            <div class="flex gap-x-2">

                <Button size="sm" @click="facebookLogin">Continue With Facebook</Button>
                <Button size="sm" @click="fetchPages">Get all pages</Button>
            </div>
        </div>
    </SettingsLayout>
</template>

<style></style>