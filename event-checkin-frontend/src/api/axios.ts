import axios from 'axios';

import {
  getAccessToken,
  clearAuth,
} from '../features/auth/utils/auth.storage';
import { ROUTES } from '../constants/routes';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401 &&
      getAccessToken() 
    ){
      clearAuth();
      window.location.href = ROUTES.LOGIN
    }

    return Promise.reject(error);
  },
);

export default api;