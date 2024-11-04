import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'

// Create a general-purpose Axios instance
const generalAxiosInstance: AxiosInstance = axios.create({
  timeout: 15000, // Set a higher timeout if necessary for third-party APIs
  headers: {
    'Content-Type': 'application/json',
  },
})

// Optional: Add a request interceptor for dynamic configurations
generalAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any logic here to modify config before sending the request
    // Example: setting a dynamic baseURL for different third-party APIs
    // if (config.url?.includes('some-third-party-api')) {
    //   config.baseURL = 'https://api.thirdparty.com'; // Example third-party base URL
    // }

    // const apiKey = process.env.VUE_APP_API_KEY || ''; // Add API keys if needed
    // if (apiKey) {
    //   config.headers['Authorization'] = `Bearer ${apiKey}`;
    // }

    //console.log('Request to third-party API started:', config.url);
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Optional: Add a response interceptor
generalAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    //console.log('Third-party API response received:', response);
    return response
  },
  (error) => {
    // Handle errors (timeouts, rate-limiting, etc.)
    //console.error('Error with third-party API:', error.response?.data || error.message);
    return Promise.reject(error)
  },
)

export default generalAxiosInstance
