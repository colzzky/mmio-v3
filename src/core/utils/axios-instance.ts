import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, CancelTokenSource } from 'axios';
import axios from 'axios';

// Create an Axios instance with common configurations
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://your-api-base-url.com', // Replace with your API base URL
  timeout: 10000, // Request timeout (optional)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track ongoing request cancellation
let cancelTokenSource: CancelTokenSource | null = null;

// Function to create a cancel token and handle cancellation of previous requests
const getCancelToken = () => {
  // If there is an ongoing request, cancel it
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Request canceled due to a new request.');
  }
  // Create a new cancel token source for the new request
  cancelTokenSource = axios.CancelToken.source();
  return cancelTokenSource.token;
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach cancel token to the request
    config.cancelToken = getCancelToken();

    // You can add auth tokens or modify config here
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('Request started:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    // Handle request cancellation
    if (axios.isCancel(error)) {
      console.log('Request was canceled:', error.message);
    } else {
      // Handle other errors globally
      console.error('API error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;