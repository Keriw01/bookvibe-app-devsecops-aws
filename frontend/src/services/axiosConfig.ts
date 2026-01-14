import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { LoginResponse } from '../responses/LoginResponse';

const axiosInstance = axios.create({ baseURL: '',
  withCredentials: true, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();
    if (method === 'post' || method === 'put' || method === 'delete' || method === 'patch') {
      const currentCsrfToken = Cookies.get('XSRF-TOKEN');

      if (currentCsrfToken) {
        config.headers['X-XSRF-TOKEN'] = currentCsrfToken;
        console.log('X-XSRF-TOKEN header set from variable:', currentCsrfToken);
      } else {
        console.warn('CSRF token variable is null. CSRF header not set. Ensure initializeCsrf was called and succeeded.');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(true);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (originalRequest && (error.response?.status === 401 || error.response?.status === 403) && originalRequest.url !== '/auth/refresh') {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
            return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.log("No refresh token available, redirecting to login.");
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        console.log("Access token expired. Attempting to refresh token...");
        const refreshResponse = await axios.post<LoginResponse>(
          `${axiosInstance.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        console.log("Token refreshed successfully.");
        
        processQueue(null);

        return axiosInstance(originalRequest);

      } catch (refreshError: any) {
        console.error("Unable to refresh token:", refreshError);
        processQueue(refreshError);
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;