
const {
    APP_FACEBOOK_ID,
  } = import.meta.env

const loadFacebookSDK = (): Promise<typeof FB> => {
    return new Promise((resolve) => {
      if (window.FB) {
        resolve(window.FB); // SDK already loaded
      } else {
        window.fbAsyncInit = function () {
          window.FB.init({
            appId: APP_FACEBOOK_ID, // Your Facebook App ID from environment variables
            cookie: true,
            xfbml: true,
            version: 'v21.0', // Use the latest version of the Facebook SDK
          });
          resolve(window.FB);
        };
  
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        document.head.appendChild(script);
      }
    });
  };
  
  // Export the load function
  export { loadFacebookSDK };