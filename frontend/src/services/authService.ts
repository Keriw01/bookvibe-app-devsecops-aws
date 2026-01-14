// import axiosInstance, { setAxiosCsrfToken } from './axiosConfig';
import axiosInstance from './axiosConfig';
import { LoginResponse } from '../responses/LoginResponse';
import { UserDto } from '../dtos/UserDto';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

export const authService = {
  async initializeCsrf(): Promise<void> {
    try {
      await axiosInstance.get('/auth/csrf-token');
      console.log('CSRF cookie should be initialized/refreshed by backend.');
    } catch (error) {
      console.error('CSRF initialization request failed:', error);
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);

    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>('/auth/register', credentials);

    return response.data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');

    console.log('Logout request sent.');
  },

  async getCurrentUser(): Promise<UserDto> {
    const response = await axiosInstance.get<UserDto>('/user/me');

    return response.data;
  },
};