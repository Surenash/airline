import axios from 'axios';

// Create an Axios instance with base configuration
const client = axios.create({
    baseURL: (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000') + '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
client.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed later
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
client.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors here, e.g., redirecting on 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // e.g., window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
